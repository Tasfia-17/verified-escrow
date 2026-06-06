import { ESCROW_PACKAGE_ID } from './sui-client';

export interface DeliverableUploadResult {
  blobId: string;
  sealPolicyId: string;
  encryptedObject: Uint8Array;
}

export async function uploadDeliverable(
  _file: File,
  _jobId: string,
  _client: string,
  _arbitrators: string[],
  _signer: unknown
): Promise<DeliverableUploadResult> {
  throw new Error('Walrus upload requires deployed contract: ' + ESCROW_PACKAGE_ID);
}

export async function uploadCriteria(
  _criteriaCode: string,
  _jobTitle: string,
  _signer: unknown
): Promise<string> {
  throw new Error('Walrus upload requires deployed contract: ' + ESCROW_PACKAGE_ID);
}

export async function downloadDeliverable(
  _blobId: string,
  _sealPolicyId: string,
  _userAddress: string,
  _signer: unknown
): Promise<Uint8Array> {
  throw new Error('Walrus download requires deployed contract');
}

export async function fetchBlobContent(_blobId: string): Promise<string> {
  throw new Error('Walrus fetch requires deployed contract');
}
