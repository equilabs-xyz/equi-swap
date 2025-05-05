import { TokenAccount } from "./token";
import {PublicKey, Transaction, Connection} from "@solana/web3.js";
export interface WalletData {
    solBalance: number;
    tokenAccounts: TokenAccount[];
    walletValue: { total: number } | null;
    solValue: { total: number } | null;
    onrampTokenId: string | null;
    offrampTokenId: string | null;
}

export type WalletMode = "BASIC" | "PRO";

export interface CloseAccountParams {
    publicKey: PublicKey;
    tokenAccount: TokenAccount;
    sendTransaction: (
        tx: Transaction,
        connection: Connection
    ) => Promise<string>;
    setTokenAccounts: (next: TokenAccount[]) => void

}


export interface RawWalletToken {
    symbol: string;
    mint: string;
    decimals: number;
    totalUiAmount: number;
    name: string;
    imageUri: string;
    swappable?: boolean;
    price?: number;
    verified?: boolean;
    actions?: unknown[];
    accounts?: Array<{ pubkey: string }>;
}


export interface RawWalletApiResult {
    success: boolean;
    error?: string;
    result: {
        value: number | null;
        solValue: number | null;
        onrampTokenId: string | null;
        offrampTokenId: string | null;
        tokens: RawWalletToken[];
    };
}