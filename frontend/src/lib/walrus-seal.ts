// Walrus + Seal integration for secure deliverable storage
import { suiClient, ESCROW_PACKAGE_ID } from './sui-client';
import { WalrusFile } from '@mysten/walrus';
import { Transaction } from '@mysten/sui/transactions';

export interface DeliverableUploadResult {
  blobId: string;
  sealPolicyId: string;
  encryptedObject: Uint8Array;
}

// Upload deliverable to Walrus with Seal encryption
export async function uploadDeliverable(
  file: File,
  jobId: string,
  client: string,
  arbitrators: string[],
  signer: any
): Promise<DeliverableUploadResult> {
  // Read file
  const buffer = await file.arrayBuffer();
  const contents = new Uint8Array(buffer);

  // Create Walrus file
  const walrusFile = WalrusFile.from({
    contents,
    identifier: `deliverable-${jobId}`,
    tags: {
      'content-type': file.type,
      'job-id': jobId,
      'uploaded-at': Date.now().toString(),
    },
  });

  // Encrypt with Seal before uploading
  // Access policy: decryptable by client OR any arbitrator
  const authorizedAddresses = [client, ...arbitrators];
  
  const { encryptedObject } = await suiClient.seal.encrypt({
    threshold: 1, // Only need 1 key server to decrypt
    packageId: ESCROW_PACKAGE_ID,
    id: jobId,
    data: contents,
  });

  // Upload encrypted deliverable to Walrus
  const results = await suiClient.walrus.writeFiles({
    files: [WalrusFile.from({
      contents: encryptedObject,
      identifier: `sealed-deliverable-${jobId}`,
      tags: {
        'encrypted': 'true',
        'job-id': jobId,
      },
    })],
    epochs: 10, // Store for ~5 months
    deletable: false,
    signer,
  });

  return {
    blobId: results[0].blobId,
    sealPolicyId: jobId, // Using job ID as seal policy identifier
    encryptedObject,
  };
}

// Upload acceptance criteria (test suite, validators) to Walrus
export async function uploadCriteria(
  criteriaCode: string,
  jobTitle: string,
  signer: any
): Promise<string> {
  const contents = new TextEncoder().encode(criteriaCode);

  const walrusFile = WalrusFile.from({
    contents,
    identifier: `criteria-${Date.now()}`,
    tags: {
      'content-type': 'text/plain',
      'job-title': jobTitle,
      'type': 'acceptance-criteria',
    },
  });

  const results = await suiClient.walrus.writeFiles({
    files: [walrusFile],
    epochs: 10,
    deletable: false,
    signer,
  });

  return results[0].blobId;
}

// Download and decrypt deliverable (for authorized users)
export async function downloadDeliverable(
  blobId: string,
  sealPolicyId: string,
  userAddress: string,
  signer: any
): Promise<Uint8Array> {
  // Fetch encrypted blob from Walrus
  const [encryptedFile] = await suiClient.walrus.getFiles({ ids: [blobId] });
  const encryptedData = await encryptedFile.bytes();

  // Build approval transaction for Seal
  const tx = new Transaction();
  tx.moveCall({
    target: `${ESCROW_PACKAGE_ID}::escrow::approve_access`,
    arguments: [
      tx.pure.address(sealPolicyId),
      tx.pure.address(userAddress),
    ],
  });

  const txBytes = await tx.build({ client: suiClient });

  // Decrypt using Seal
  const decryptedData = await suiClient.seal.decrypt({
    data: encryptedData,
    sessionKey: await createSessionKey(userAddress, signer),
    txBytes,
  });

  return decryptedData;
}

// Create Seal session key for decryption
async function createSessionKey(address: string, signer: any) {
  const { SessionKey } = await import('@mysten/seal');
  
  return SessionKey.create({
    address,
    packageId: ESCROW_PACKAGE_ID,
    ttlMin: 60, // 1 hour TTL
    signer,
    suiClient,
  });
}

// Fetch blob content (for public criteria)
export async function fetchBlobContent(blobId: string): Promise<string> {
  const [file] = await suiClient.walrus.getFiles({ ids: [blobId] });
  const text = await file.text();
  return text;
}
