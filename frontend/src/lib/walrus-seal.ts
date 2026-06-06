// Walrus + Seal integration stubs
// Full implementation requires Walrus/Seal SDK with SuiGrpcClient
import { ESCROW_PACKAGE_ID } from './sui-client';

export interface DeliverableUploadResult {
  blobId: string;
  sealPolicyId: string;
  encryptedObject: Uint8Array;
}

export async function uploadDeliverable(
  file: File,
  jobId: string,
  client: string,
  arbitrators: string[],
  signer: any
): Promise<DeliverableUploadResult> {
  throw new Error('Walrus upload requires deployed contract: ' + ESCROW_PACKAGE_ID);
}

export async function uploadCriteria(
  criteriaCode: string,
  jobTitle: string,
  signer: any
): Promise<string> {
  throw new Error('Walrus upload requires deployed contract: ' + ESCROW_PACKAGE_ID);
}

export async function downloadDeliverable(
  blobId: string,
  sealPolicyId: string,
  userAddress: string,
  signer: any
): Promise<Uint8Array> {
  throw new Error('Walrus download requires deployed contract');
}

export async function fetchBlobContent(blobId: string): Promise<string> {
  throw new Error('Walrus fetch requires deployed contract');
}
