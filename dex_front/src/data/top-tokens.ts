// src/data/top-tokens.ts
interface TokenInfo {
    name: string;
    symbol: string;
    address: string;
    logoURI: string;
    decimals: number;
    balance?: number;
    verified: boolean;
}
export const TopTokens: TokenInfo[] = [
    {
        address: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        name: 'Wrapped SOL',
        symbol: 'SOL',
        verified: true
    },
    {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        name: 'USD Coin',
        symbol: 'USDC',
        verified: true
    },
    {
        address: 'Es9vMFrzaCER2cB9pu5vBqkx2pA3qwfuuyGfyz1fhr8t',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCER2cB9pu5vBqkx2pA3qwfuuyGfyz1fhr8t/logo.png',
        name: 'Tether USD',
        symbol: 'USDT',
        verified: true
    },
    {
        address: 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB/logo.png',
        name: 'Jupiter',
        symbol: 'JUP',
        verified: true
    },
    {
        address: 'DezX5F7Rh2uKxAj86pJhZQycRbWYW7bhr7cds93xbGkF',
        decimals: 5,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezX5F7Rh2uKxAj86pJhZQycRbWYW7bhr7cds93xbGkF/logo.png',
        name: 'Bonk',
        symbol: 'BONK',
        verified: true
    },
    // Add more if needed...
];
