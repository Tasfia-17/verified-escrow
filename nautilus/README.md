# Nautilus TEE Enclave - Verified Escrow

This enclave runs acceptance criteria (tests, validators, linters) in an isolated AWS Nitro Enclave and produces cryptographic attestations.

## Architecture

1. **Ephemeral Keypair**: Generated at enclave startup from AWS Nitro measurements
2. **Verification Endpoint**: Receives deliverable + criteria, executes in isolation
3. **Attestation Signing**: Signs results with enclave private key (never leaves TEE)
4. **On-chain Verification**: Sui Move contract verifies signature before releasing payment

## Endpoints

### `GET /health_check`
Health check endpoint.

### `GET /get_attestation`
Returns the enclave's public key and AWS Nitro attestation document for on-chain registration.

Response:
```json
{
  "public_key": "hex-encoded-ed25519-public-key",
  "attestation_document": "base64-encoded-nitro-attestation"
}
```

### `POST /process_data`
Executes verification of a deliverable against acceptance criteria.

Request:
```json
{
  "deliverable_blob_id": "walrus-blob-id",
  "criteria_blob_id": "walrus-blob-id",
  "deliverable_content": [/* bytes */],
  "criteria_code": "#!/bin/bash\nnpm test\nexit $?"
}
```

Response:
```json
{
  "blob_id": "walrus-blob-id",
  "passed": true,
  "criteria_blob_id": "walrus-blob-id",
  "details": "Exit code: 0\nSTDOUT: All tests passed...",
  "timestamp_ms": 1717704000000,
  "signature": "hex-encoded-ed25519-signature"
}
```

## Deployment

### Prerequisites

- AWS account with Nitro Enclave support
- EC2 instance with Nitro Enclaves enabled
- Docker

### Build

```bash
cargo build --release
```

### Run Locally (Development)

```bash
cargo run
```

### Build Docker Image

```bash
docker build -t verified-escrow-enclave .
```

### Deploy to AWS Nitro Enclave

Follow the [Nautilus deployment guide](https://docs.sui.io/sui-stack/nautilus/using-nautilus) for AWS Nitro Enclave deployment.

## Security Properties

- **Isolation**: No host OS access to enclave memory
- **Attestation**: PCR measurements prove enclave identity
- **Key Security**: Private key never leaves enclave
- **Deterministic**: Same input → same output (verifiable)

## Example Acceptance Criteria

### JavaScript Tests
```bash
#!/bin/bash
npm install
npm test
exit $?
```

### Python Tests
```bash
#!/bin/bash
pytest tests/
exit $?
```

### Code Quality
```bash
#!/bin/bash
eslint src/
exit $?
```

### Word Count
```bash
#!/bin/bash
count=$(wc -w < $DELIVERABLE_PATH)
if [ $count -ge 1000 ]; then
  exit 0
else
  exit 1
fi
```

## Environment Variables

- `DELIVERABLE_PATH`: Path to the deliverable file (set automatically)

## On-chain Integration

The enclave's signature is verified on-chain using the `enclave` module from Nautilus:

```move
enclave::verify_signature(
    enclave,
    &signature,
    &attestation_data,
    VERIFICATION_INTENT,
    timestamp_ms
);
```

This ensures that only authentic enclaves can submit verification results.
