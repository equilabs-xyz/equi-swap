export interface TokenMetadata {
    name: string;
    symbol: string;
    logoURI: string;
    decimals: number;
}

export interface TokenAccount {
    pubkey: string;
    mint: string;
    balance: number;
    decimals: number;
    metadata: TokenMetadata;
    price: number | null;
    verified: boolean;
    actions: any[]; // Replace with specific action types if available
}



export interface TokenInfo {
    name: string;
    symbol: string;
    address: string;
    logoURI: string;
    decimals: number;
    balance?: number;
    verified: boolean;
}
