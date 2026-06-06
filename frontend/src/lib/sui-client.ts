// Tatum Sui client configuration
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';
import { seal } from '@mysten/seal';

const TATUM_API_KEY = process.env.NEXT_PUBLIC_TATUM_API_KEY!;
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet';
const TATUM_SUI_RPC = process.env.NEXT_PUBLIC_TATUM_SUI_RPC!;

export const suiClient = new SuiGrpcClient({
  network: SUI_NETWORK,
  baseUrl: `${TATUM_SUI_RPC}?apiKey=${TATUM_API_KEY}`,
}).$extend(walrus()).$extend(seal({
  serverConfigs: [
    // Seal key servers will be configured based on deployment
  ],
  verifyKeyServers: true,
  timeout: 30000,
}));

export const ESCROW_PACKAGE_ID = process.env.NEXT_PUBLIC_ESCROW_PACKAGE_ID!;
export const PLATFORM_ID = process.env.NEXT_PUBLIC_PLATFORM_ID!;
export const NAUTILUS_ENCLAVE_ID = process.env.NEXT_PUBLIC_NAUTILUS_ENCLAVE_ID!;
