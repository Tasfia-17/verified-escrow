// Tatum Sui client configuration
import { SuiClient } from '@mysten/sui/client';

const TATUM_API_KEY = 't-6a245613676dd5cdbaa72701-ff030e28ab0d4fcd93513999';
const TATUM_SUI_RPC = 'https://sui-testnet.gateway.tatum.io';

export const suiClient = new SuiClient({
  url: `${TATUM_SUI_RPC}?apiKey=${TATUM_API_KEY}`,
});

export const ESCROW_PACKAGE_ID = '';
export const PLATFORM_ID = '';
export const NAUTILUS_ENCLAVE_ID = '';
