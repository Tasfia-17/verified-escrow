// Tatum Data API integration
const TATUM_API_KEY = 't-6a245613676dd5cdbaa72701-ff030e28ab0d4fcd93513999';
const TATUM_DATA_API = 'https://api.tatum.io/v4';

export interface WalletBalance {
  chain: string;
  address: string;
  balance: string;
  assets: {
    symbol: string;
    balance: string;
    decimals: number;
  }[];
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: number;
}

// Get wallet balance using Tatum Data API
export async function getWalletBalance(address: string): Promise<WalletBalance> {
  const response = await fetch(
    `${TATUM_DATA_API}/data/balances?chain=sui&addresses=${address}`,
    {
      headers: {
        'x-api-key': TATUM_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Tatum API error: ${response.statusText}`);
  }

  return response.json();
}

// Get exchange rate (SUI to USD)
export async function getExchangeRate(from: string = 'SUI', to: string = 'USD'): Promise<ExchangeRate> {
  const response = await fetch(
    `${TATUM_DATA_API}/data/rates?basePair=${from}&currency=${to}`,
    {
      headers: {
        'x-api-key': TATUM_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Tatum API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    fromCurrency: from,
    toCurrency: to,
    rate: data.value,
    timestamp: Date.now(),
  };
}

// Convert MIST to USD
export async function mistToUSD(mist: bigint): Promise<number> {
  const rate = await getExchangeRate('SUI', 'USD');
  const sui = Number(mist) / 1_000_000_000; // MIST to SUI
  return sui * rate.rate;
}

// Convert USD to MIST
export async function usdToMIST(usd: number): Promise<bigint> {
  const rate = await getExchangeRate('SUI', 'USD');
  const sui = usd / rate.rate;
  return BigInt(Math.round(sui * 1_000_000_000));
}
