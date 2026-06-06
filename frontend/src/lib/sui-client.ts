// Tatum Sui client configuration
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';
import { seal } from '@mysten/seal';

const TATUM_API_KEY = 't-6a245613676dd5cdbaa72701-ff030e28ab0d4fcd93513999';
const SUI_NETWORK: 'testnet' = 'testnet';
const TATUM_SUI_RPC = 'https://sui-testnet.gateway.tatum.io';

export const suiClient = new SuiGrpcClient({
  network: SUI_NETWORK,
  baseUrl: `${TATUM_SUI_RPC}?apiKey=${TATUM_API_KEY}`,
}).$extend(walrus()).$extend(seal({
  serverConfigs: [],
  verifyKeyServers: true,
  timeout: 30000,
}));

export const ESCROW_PACKAGE_ID = process.env.NEXT_PUBLIC_ESCROW_PACKAGE_ID || '';
export const PLATFORM_ID = process.env.NEXT_PUBLIC_PLATFORM_ID || '';
export const NAUTILUS_ENCLAVE_ID = process.env.NEXT_PUBLIC_NAUTILUS_ENCLAVE_ID || '';
