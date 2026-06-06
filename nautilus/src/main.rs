/// Nautilus TEE Enclave for Verified Escrow
/// 
/// Runs acceptance criteria (tests, validators) in AWS Nitro Enclave
/// and produces cryptographic attestations for on-chain verification.

use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use ed25519_dalek::{Keypair, Signer};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::process::{Command, Stdio};
use std::io::Write;

const VERIFICATION_INTENT: u8 = 1;

#[derive(Debug, Serialize, Deserialize)]
struct VerificationRequest {
    deliverable_blob_id: String,
    criteria_blob_id: String,
    /// The actual deliverable content (fetched from Walrus by caller)
    deliverable_content: Vec<u8>,
    /// Acceptance criteria code (fetched from Walrus by caller)
    criteria_code: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct VerificationResponse {
    blob_id: String,
    passed: bool,
    criteria_blob_id: String,
    details: String,
    timestamp_ms: u64,
    signature: String, // hex-encoded
}

#[derive(Debug, Serialize, Deserialize)]
struct AttestationResponse {
    public_key: String,
    attestation_document: String, // base64-encoded
}

#[tokio::main]
async fn main() {
    // Generate ephemeral keypair at enclave startup
    // In production, this would be derived from enclave measurements
    let mut csprng = rand::rngs::OsRng;
    let keypair = Keypair::generate(&mut csprng);
    
    // Store keypair in a way that's accessible to handlers
    let app_state = std::sync::Arc::new(AppState {
        keypair,
    });

    let app = Router::new()
        .route("/health_check", get(health_check))
        .route("/get_attestation", get(get_attestation))
        .route("/process_data", post(process_verification))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .unwrap();

    println!("Nautilus enclave listening on port 8080");

    axum::serve(listener, app).await.unwrap();
}

struct AppState {
    keypair: Keypair,
}

async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "verified-escrow-enclave"
    }))
}

async fn get_attestation(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<AppState>>,
) -> impl IntoResponse {
    // In production, generate real AWS Nitro attestation document
    // For now, return public key for registration
    
    let public_key_bytes = state.keypair.public.to_bytes();
    let public_key_hex = hex::encode(public_key_bytes);

    Json(AttestationResponse {
        public_key: public_key_hex,
        attestation_document: "mock_attestation_document".to_string(),
    })
}

async fn process_verification(
    axum::extract::State(state): axum::extract::State<std::sync::Arc<AppState>>,
    Json(req): Json<VerificationRequest>,
) -> Result<Json<VerificationResponse>, (StatusCode, String)> {
    println!("Processing verification for blob: {}", req.deliverable_blob_id);

    // Step 1: Write deliverable to temp file
    let temp_dir = std::env::temp_dir();
    let deliverable_path = temp_dir.join("deliverable");
    std::fs::write(&deliverable_path, &req.deliverable_content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to write deliverable: {}", e)))?;

    // Step 2: Write criteria script to temp file
    let criteria_path = temp_dir.join("criteria.sh");
    std::fs::write(&criteria_path, &req.criteria_code)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to write criteria: {}", e)))?;

    // Make criteria script executable
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = std::fs::metadata(&criteria_path)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .permissions();
        perms.set_mode(0o755);
        std::fs::set_permissions(&criteria_path, perms)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    // Step 3: Execute criteria script with deliverable
    let output = Command::new("/bin/bash")
        .arg(&criteria_path)
        .env("DELIVERABLE_PATH", &deliverable_path)
        .current_dir(&temp_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to execute criteria: {}", e)))?;

    let passed = output.status.success();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    
    let details = format!(
        "Exit code: {}\n\nSTDOUT:\n{}\n\nSTDERR:\n{}",
        output.status.code().unwrap_or(-1),
        stdout,
        stderr
    );

    // Step 4: Create attestation
    let timestamp_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    // Step 5: Sign attestation using BCS serialization (matching Move contract)
    let signature = sign_attestation(
        &state.keypair,
        &req.deliverable_blob_id,
        passed,
        &req.criteria_blob_id,
        &details,
        timestamp_ms,
    );

    // Cleanup temp files
    let _ = std::fs::remove_file(deliverable_path);
    let _ = std::fs::remove_file(criteria_path);

    Ok(Json(VerificationResponse {
        blob_id: req.deliverable_blob_id,
        passed,
        criteria_blob_id: req.criteria_blob_id,
        details,
        timestamp_ms,
        signature: hex::encode(signature.to_bytes()),
    }))
}

fn sign_attestation(
    keypair: &Keypair,
    blob_id: &str,
    passed: bool,
    criteria_blob_id: &str,
    details: &str,
    timestamp_ms: u64,
) -> ed25519_dalek::Signature {
    // Serialize using BCS to match Move contract expectations
    let mut data = Vec::new();
    
    // Blob ID as bytes
    data.extend(bcs::to_bytes(blob_id.as_bytes()).unwrap());
    // Passed as bool
    data.extend(bcs::to_bytes(&passed).unwrap());
    // Criteria blob ID as bytes
    data.extend(bcs::to_bytes(criteria_blob_id.as_bytes()).unwrap());
    // Details as bytes
    data.extend(bcs::to_bytes(details.as_bytes()).unwrap());
    // Timestamp
    data.extend(bcs::to_bytes(&timestamp_ms).unwrap());

    // Add intent prefix
    let mut message = vec![VERIFICATION_INTENT];
    message.extend(data);

    // Sign
    keypair.sign(&message)
}
