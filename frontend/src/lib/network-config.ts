'use client';

import { createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';

const { networkConfig, useNetworkVariable } = createNetworkConfig({
  mainnet: {
    url: process.env.NEXT_PUBLIC_TATUM_SUI_RPC || getFullnodeUrl('mainnet'),
  },
  testnet: {
    url: getFullnodeUrl('testnet'),
  },
});

export { networkConfig, useNetworkVariable };
