import { TokenAccount } from "./token";
import { WalletMode } from "./wallet";
import {PublicKey} from "@solana/web3.js";
export interface WalletTabsProps {
    loading: boolean;
    tokenAccounts: TokenAccount[];
    setCurrentToken: (token: TokenAccount) => void;
    setShowSend: (open: boolean) => void;
    mode: WalletMode;
    handleCloseAccount: (account: TokenAccount) => void;
    address: string;
}

export interface WalletSendDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    tokenAccounts: TokenAccount[];
    currentToken: TokenAccount | null;
    setCurrentToken: (token: TokenAccount | null) => void;
    publicKey: PublicKey;
    fetchData: () => void;
}

export interface ReceiveDialogProps {
    publicKey: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export interface TokenSelectDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    tokenAccounts: TokenAccount[];
    onSelect: (token: TokenAccount) => void;
}

export interface WalletActionsProps {
    publicKey: string;
    onSendClick: () => void;
    onReceiveClick: () => void;
}
