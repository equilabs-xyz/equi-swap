// src/data/token-list.ts

export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  logoURI: string;
  decimals: number;
  balance?: number;
  verified: boolean;
}
