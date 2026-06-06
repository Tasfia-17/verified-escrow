/// Verified Escrow - Trustless freelance delivery with cryptographic verification
/// 
/// Core contracts for job creation, payment escrow, Nautilus TEE verification,
/// and Seal-based access control for deliverables stored on Walrus.
module verified_escrow::escrow {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use enclave::verifier;

    // ========== Constants ==========
    
    /// Intent domain separator for verification attestations
    const VERIFICATION_INTENT: u8 = 1;
    
    // Error codes
    const EInvalidState: u64 = 0;
    const EUnauthorized: u64 = 1;
    const EInvalidAttestation: u64 = 2;
    const EInsufficientPayment: u64 = 3;
    const EJobNotDisputed: u64 = 4;
    const EAlreadyVoted: u64 = 5;

    // ========== Structs ==========

    /// Job states
    public struct JobCreated has drop {}
    public struct JobSubmitted has drop {}
    public struct JobVerified has drop {}
    public struct JobDisputed has drop {}
    public struct JobCompleted has drop {}
    public struct JobRefunded has drop {}

    /// Main job object holding escrow state
    public struct Job has key, store {
        id: UID,
        /// Client who created the job
        client: address,
        /// Freelancer who accepted (none until accepted)
        freelancer: Option<address>,
        /// Payment amount in MIST
        payment: Coin<SUI>,
        /// Job description and requirements
        title: vector<u8>,
        description: vector<u8>,
        /// Walrus blob ID for acceptance criteria (test suite, validators)
        criteria_blob_id: vector<u8>,
        /// Walrus blob ID for deliverable (set when freelancer submits)
        deliverable_blob_id: Option<vector<u8>>,
        /// Seal access policy ID (controls who can decrypt deliverable)
        seal_policy_id: Option<address>,
        /// Current state
        state: u8, // 0=created, 1=submitted, 2=verified_pass, 3=verified_fail, 4=disputed, 5=completed, 6=refunded
        /// Nautilus enclave attestation (set when verified)
        attestation: Option<VerificationAttestation>,
        /// Dispute arbitrators (multi-sig committee)
        arbitrators: vector<address>,
        /// Dispute votes: address -> bool (true=approve, false=reject)
        dispute_votes: vector<DisputeVote>,
        /// Required arbitrator approvals for dispute resolution
        required_approvals: u64,
        /// Timestamp
        created_at: u64,
        updated_at: u64,
    }

    /// Nautilus TEE verification attestation
    public struct VerificationAttestation has store, drop {
        /// Blob ID that was verified
        blob_id: vector<u8>,
        /// Verification result: true=pass, false=fail
        passed: bool,
        /// Criteria that was checked
        criteria_blob_id: vector<u8>,
        /// Verification details (logs, test results)
        details: vector<u8>,
        /// Timestamp from enclave
        timestamp_ms: u64,
        /// Enclave signature
        signature: vector<u8>,
    }

    /// Dispute vote from an arbitrator
    public struct DisputeVote has store, drop {
        arbitrator: address,
        approved: bool,
        timestamp: u64,
    }

    /// Capability for platform admin operations
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Shared platform config
    public struct Platform has key {
        id: UID,
        /// Registered Nautilus enclave for verifications
        enclave_id: address,
        /// Platform fee in basis points (100 = 1%)
        fee_bps: u64,
        /// Fee collector address
        fee_collector: address,
    }

    // ========== Events ==========

    public struct JobCreatedEvent has copy, drop {
        job_id: address,
        client: address,
        payment_amount: u64,
        title: vector<u8>,
    }

    public struct JobAcceptedEvent has copy, drop {
        job_id: address,
        freelancer: address,
    }

    public struct JobSubmittedEvent has copy, drop {
        job_id: address,
        deliverable_blob_id: vector<u8>,
        seal_policy_id: address,
    }

    public struct JobVerifiedEvent has copy, drop {
        job_id: address,
        passed: bool,
        details: vector<u8>,
    }

    public struct JobDisputedEvent has copy, drop {
        job_id: address,
        disputer: address,
    }

    public struct DisputeVotedEvent has copy, drop {
        job_id: address,
        arbitrator: address,
        approved: bool,
    }

    public struct JobCompletedEvent has copy, drop {
        job_id: address,
        freelancer: address,
        amount: u64,
    }

    public struct JobRefundedEvent has copy, drop {
        job_id: address,
        client: address,
        amount: u64,
    }

    // ========== Init ==========

    fun init(ctx: &mut TxContext) {
        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, ctx.sender());

        // Create platform config (enclave will be registered later)
        let platform = Platform {
            id: object::new(ctx),
            enclave_id: @0x0,
            fee_bps: 250, // 2.5% platform fee
            fee_collector: ctx.sender(),
        };
        transfer::share_object(platform);
    }

    // ========== Client Functions ==========

    /// Create a new job with payment and acceptance criteria
    public entry fun create_job(
        payment: Coin<SUI>,
        title: vector<u8>,
        description: vector<u8>,
        criteria_blob_id: vector<u8>,
        arbitrators: vector<address>,
        required_approvals: u64,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) > 0, EInsufficientPayment);
        assert!(required_approvals > 0 && required_approvals <= vector::length(&arbitrators), EInvalidState);

        let job_uid = object::new(ctx);
        let job_id = object::uid_to_address(&job_uid);

        let job = Job {
            id: job_uid,
            client: ctx.sender(),
            freelancer: option::none(),
            payment,
            title,
            description,
            criteria_blob_id,
            deliverable_blob_id: option::none(),
            seal_policy_id: option::none(),
            state: 0, // created
            attestation: option::none(),
            arbitrators,
            dispute_votes: vector::empty(),
            required_approvals,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            updated_at: tx_context::epoch_timestamp_ms(ctx),
        };

        event::emit(JobCreatedEvent {
            job_id,
            client: ctx.sender(),
            payment_amount: coin::value(&job.payment),
            title: job.title,
        });

        transfer::share_object(job);
    }

    /// Client cancels job if no freelancer accepted yet
    public entry fun cancel_job(
        job: &mut Job,
        ctx: &mut TxContext
    ) {
        assert!(job.client == ctx.sender(), EUnauthorized);
        assert!(job.state == 0, EInvalidState); // must be in created state
        assert!(option::is_none(&job.freelancer), EInvalidState);

        let payment = coin::zero<SUI>(ctx);
        coin::join(&mut payment, coin::split(&mut job.payment, coin::value(&job.payment), ctx));
        
        transfer::public_transfer(payment, job.client);
        
        job.state = 6; // refunded
        job.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(JobRefundedEvent {
            job_id: object::uid_to_address(&job.id),
            client: job.client,
            amount: coin::value(&payment),
        });
    }

    // ========== Freelancer Functions ==========

    /// Freelancer accepts the job
    public entry fun accept_job(
        job: &mut Job,
        ctx: &mut TxContext
    ) {
        assert!(job.state == 0, EInvalidState); // must be created
        assert!(option::is_none(&job.freelancer), EInvalidState);

        job.freelancer = option::some(ctx.sender());
        job.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(JobAcceptedEvent {
            job_id: object::uid_to_address(&job.id),
            freelancer: ctx.sender(),
        });
    }

    /// Freelancer submits deliverable (blob stored on Walrus, encrypted with Seal)
    public entry fun submit_deliverable(
        job: &mut Job,
        deliverable_blob_id: vector<u8>,
        seal_policy_id: address,
        ctx: &mut TxContext
    ) {
        assert!(option::is_some(&job.freelancer), EInvalidState);
        assert!(*option::borrow(&job.freelancer) == ctx.sender(), EUnauthorized);
        assert!(job.state == 0, EInvalidState); // must be in accepted state

        job.deliverable_blob_id = option::some(deliverable_blob_id);
        job.seal_policy_id = option::some(seal_policy_id);
        job.state = 1; // submitted
        job.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(JobSubmittedEvent {
            job_id: object::uid_to_address(&job.id),
            deliverable_blob_id,
            seal_policy_id,
        });
    }

    // ========== Verification Functions ==========

    /// Nautilus enclave submits verification attestation
    public entry fun verify_deliverable(
        platform: &Platform,
        job: &mut Job,
        enclave: &verifier::Enclave,
        blob_id: vector<u8>,
        passed: bool,
        criteria_blob_id: vector<u8>,
        details: vector<u8>,
        timestamp_ms: u64,
        signature: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(job.state == 1, EInvalidState); // must be submitted
        assert!(option::is_some(&job.deliverable_blob_id), EInvalidState);
        assert!(*option::borrow(&job.deliverable_blob_id) == blob_id, EInvalidAttestation);
        assert!(job.criteria_blob_id == criteria_blob_id, EInvalidAttestation);

        // Verify signature from Nautilus enclave
        let attestation_data = verification_data_to_bytes(
            &blob_id,
            passed,
            &criteria_blob_id,
            &details,
            timestamp_ms
        );

        verifier::verify_signature(
            enclave,
            &signature,
            &attestation_data,
            VERIFICATION_INTENT,
            timestamp_ms
        );

        // Store attestation
        let attestation = VerificationAttestation {
            blob_id,
            passed,
            criteria_blob_id,
            details,
            timestamp_ms,
            signature,
        };

        job.attestation = option::some(attestation);
        job.state = if (passed) { 2 } else { 3 }; // verified_pass or verified_fail
        job.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(JobVerifiedEvent {
            job_id: object::uid_to_address(&job.id),
            passed,
            details,
        });

        // Auto-complete or auto-refund based on verification
        if (passed) {
            complete_job_internal(platform, job, ctx);
        } else {
            refund_job_internal(platform, job, ctx);
        };
    }

    // ========== Dispute Functions ==========

    /// Client or freelancer initiates dispute
    public entry fun initiate_dispute(
        job: &mut Job,
        ctx: &mut TxContext
    ) {
        assert!(job.client == ctx.sender() || 
                (option::is_some(&job.freelancer) && *option::borrow(&job.freelancer) == ctx.sender()), 
                EUnauthorized);
        assert!(job.state == 2 || job.state == 3, EInvalidState); // must be verified

        job.state = 4; // disputed
        job.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(JobDisputedEvent {
            job_id: object::uid_to_address(&job.id),
            disputer: ctx.sender(),
        });
    }

    /// Arbitrator votes on dispute (approved=true means pay freelancer, false=refund client)
    public entry fun vote_dispute(
        job: &mut Job,
        approved: bool,
        ctx: &mut TxContext
    ) {
        assert!(job.state == 4, EJobNotDisputed);
        assert!(vector::contains(&job.arbitrators, &ctx.sender()), EUnauthorized);

        // Check if arbitrator already voted
        let i = 0;
        let len = vector::length(&job.dispute_votes);
        while (i < len) {
            let vote = vector::borrow(&job.dispute_votes, i);
            assert!(vote.arbitrator != ctx.sender(), EAlreadyVoted);
            i = i + 1;
        };

        // Record vote
        let vote = DisputeVote {
            arbitrator: ctx.sender(),
            approved,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        };
        vector::push_back(&mut job.dispute_votes, vote);

        event::emit(DisputeVotedEvent {
            job_id: object::uid_to_address(&job.id),
            arbitrator: ctx.sender(),
            approved,
        });

        // Check if we have enough votes
        let (approve_count, reject_count) = count_dispute_votes(job);
        
        if (approve_count >= job.required_approvals) {
            // Complete job
            complete_job_internal(&Platform { 
                id: object::new(ctx), 
                enclave_id: @0x0,
                fee_bps: 250,
                fee_collector: @0x0
            }, job, ctx);
        } else if (reject_count >= job.required_approvals) {
            // Refund job
            refund_job_internal(&Platform { 
                id: object::new(ctx), 
                enclave_id: @0x0,
                fee_bps: 250,
                fee_collector: @0x0
            }, job, ctx);
        };
    }

    // ========== Internal Functions ==========

    fun complete_job_internal(
        platform: &Platform,
        job: &mut Job,
        ctx: &mut TxContext
    ) {
        assert!(option::is_some(&job.freelancer), EInvalidState);
        
        let total_amount = coin::value(&job.payment);
        let fee_amount = (total_amount * platform.fee_bps) / 10000;
        let freelancer_amount = total_amount - fee_amount;

        // Split payment
        let fee = coin::split(&mut job.payment, fee_amount, ctx);
        let payment = coin::split(&mut job.payment, freelancer_amount, ctx);

        // Transfer funds
        transfer::public_transfer(fee, platform.fee_collector);
        transfer::public_transfer(payment, *option::borrow(&job.freelancer));

        job.state = 5; // completed
        job.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(JobCompletedEvent {
            job_id: object::uid_to_address(&job.id),
            freelancer: *option::borrow(&job.freelancer),
            amount: freelancer_amount,
        });
    }

    fun refund_job_internal(
        platform: &Platform,
        job: &mut Job,
        ctx: &mut TxContext
    ) {
        let total_amount = coin::value(&job.payment);
        let refund = coin::split(&mut job.payment, total_amount, ctx);

        transfer::public_transfer(refund, job.client);

        job.state = 6; // refunded
        job.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(JobRefundedEvent {
            job_id: object::uid_to_address(&job.id),
            client: job.client,
            amount: total_amount,
        });
    }

    fun count_dispute_votes(job: &Job): (u64, u64) {
        let approve_count = 0;
        let reject_count = 0;
        
        let i = 0;
        let len = vector::length(&job.dispute_votes);
        while (i < len) {
            let vote = vector::borrow(&job.dispute_votes, i);
            if (vote.approved) {
                approve_count = approve_count + 1;
            } else {
                reject_count = reject_count + 1;
            };
            i = i + 1;
        };

        (approve_count, reject_count)
    }

    fun verification_data_to_bytes(
        blob_id: &vector<u8>,
        passed: bool,
        criteria_blob_id: &vector<u8>,
        details: &vector<u8>,
        timestamp_ms: u64
    ): vector<u8> {
        use sui::bcs;
        
        let data = vector::empty<u8>();
        vector::append(&mut data, bcs::to_bytes(blob_id));
        vector::append(&mut data, bcs::to_bytes(&passed));
        vector::append(&mut data, bcs::to_bytes(criteria_blob_id));
        vector::append(&mut data, bcs::to_bytes(details));
        vector::append(&mut data, bcs::to_bytes(&timestamp_ms));
        data
    }

    // ========== Admin Functions ==========

    /// Register Nautilus enclave for verifications
    public entry fun register_enclave(
        _admin_cap: &AdminCap,
        platform: &mut Platform,
        enclave_id: address,
        _ctx: &mut TxContext
    ) {
        platform.enclave_id = enclave_id;
    }

    /// Update platform fee
    public entry fun update_fee(
        _admin_cap: &AdminCap,
        platform: &mut Platform,
        new_fee_bps: u64,
        _ctx: &mut TxContext
    ) {
        assert!(new_fee_bps <= 1000, EInvalidState); // Max 10% fee
        platform.fee_bps = new_fee_bps;
    }

    // ========== View Functions ==========

    public fun get_job_state(job: &Job): u8 {
        job.state
    }

    public fun get_payment_amount(job: &Job): u64 {
        coin::value(&job.payment)
    }

    public fun get_client(job: &Job): address {
        job.client
    }

    public fun get_freelancer(job: &Job): Option<address> {
        job.freelancer
    }

    public fun get_deliverable_blob_id(job: &Job): Option<vector<u8>> {
        job.deliverable_blob_id
    }

    public fun get_attestation_passed(job: &Job): Option<bool> {
        if (option::is_some(&job.attestation)) {
            let att = option::borrow(&job.attestation);
            option::some(att.passed)
        } else {
            option::none()
        }
    }
}
