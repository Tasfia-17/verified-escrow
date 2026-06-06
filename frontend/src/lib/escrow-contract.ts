// Move contract interactions
import { Transaction } from '@mysten/sui/transactions';
import { suiClient, ESCROW_PACKAGE_ID, PLATFORM_ID } from './sui-client';

export interface JobData {
  id: string;
  client: string;
  freelancer: string | null;
  paymentAmount: string;
  title: string;
  description: string;
  criteriaBlobId: string;
  deliverableBlobId: string | null;
  sealPolicyId: string | null;
  state: number;
  attestation: AttestationData | null;
  arbitrators: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AttestationData {
  blobId: string;
  passed: boolean;
  details: string;
  timestampMs: number;
}

// Create a new job
export async function createJob(params: {
  paymentMIST: bigint;
  title: string;
  description: string;
  criteriaBlobId: string;
  arbitrators: string[];
  requiredApprovals: number;
  signer: any;
}) {
  const tx = new Transaction();

  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(params.paymentMIST)]);

  tx.moveCall({
    target: `${ESCROW_PACKAGE_ID}::escrow::create_job`,
    arguments: [
      coin,
      tx.pure.string(params.title),
      tx.pure.string(params.description),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.criteriaBlobId))),
      tx.pure.vector('address', params.arbitrators),
      tx.pure.u64(params.requiredApprovals),
    ],
  });

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: params.signer,
  });

  return result.digest;
}

// Accept a job
export async function acceptJob(jobId: string, signer: any) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${ESCROW_PACKAGE_ID}::escrow::accept_job`,
    arguments: [tx.object(jobId)],
  });

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
  });

  return result.digest;
}

// Submit deliverable
export async function submitDeliverable(params: {
  jobId: string;
  deliverableBlobId: string;
  sealPolicyId: string;
  signer: any;
}) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${ESCROW_PACKAGE_ID}::escrow::submit_deliverable`,
    arguments: [
      tx.object(params.jobId),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.deliverableBlobId))),
      tx.pure.address(params.sealPolicyId),
    ],
  });

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: params.signer,
  });

  return result.digest;
}

export function getJobStateName(state: number): string {
  const states = ['Created', 'Submitted', 'Verified (Pass)', 'Verified (Fail)', 'Disputed', 'Completed', 'Refunded'];
  return states[state] || 'Unknown';
}
