'use client';

import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable } = createNetworkConfig({
  testnet: {
    url: 'https://sui-testnet.gateway.tatum.io?apiKey=t-6a245613676dd5cdbaa72701-ff030e28ab0d4fcd93513999',
  },
});

export { networkConfig, useNetworkVariable };
