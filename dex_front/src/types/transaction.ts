export type TransactionType =
    | "SENT"
    | "RECEIVED"
    | "CLOSED ACCOUNT"
    | "APP INTERACTION"
    | "UNKNOWN";

export interface WalletTransaction {
    signature: string;
    timestamp: number;
    amount: string;
    symbol?: string;
    status?: string;
    type?: TransactionType;
    picture?: string;
}



export interface WalletTransactionsTabProps {
    loading: boolean;
    transactions: WalletTransaction[];
    address: string;
}