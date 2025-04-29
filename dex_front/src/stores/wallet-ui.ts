import { create } from "zustand";

type TokenAccount = any; // Replace with your actual type

type WalletUIState = {
  currentToken: TokenAccount | null;
  showSend: boolean;
  showReceive: boolean;
  mode: "BASIC" | "PRO";

  setCurrentToken: (token: TokenAccount | null) => void;
  setShowSend: (show: boolean) => void;
  setShowReceive: (show: boolean) => void;
  setMode: (mode: "BASIC" | "PRO") => void;
  showBalance: boolean;
  showUsd: boolean;
  setShowBalance: (value: boolean) => void;
  setShowUsd: (value: boolean) => void;

  selectedToken: any;
  tokenSearch: string;
  selectOpen: boolean;

  setSelectedToken: (token: any) => void;
  setTokenSearch: (value: string) => void;
  setSelectOpen: (open: boolean) => void;
};

export const useWalletUIStore = create<WalletUIState>((set) => ({
  currentToken: null,
  showSend: false,
  showReceive: false,
  mode: "BASIC",

  setCurrentToken: (token) => set({ currentToken: token }),
  setShowSend: (show) => set({ showSend: show }),
  setShowReceive: (show) => set({ showReceive: show }),
  setMode: (mode) => set({ mode }),

  showBalance: true,
  showUsd: true,
  setShowBalance: (value) => set({ showBalance: value }),
  setShowUsd: (value) => set({ showUsd: value }),

  selectedToken: null,
  tokenSearch: "",
  selectOpen: false,

  setSelectedToken: (token) => set({ selectedToken: token }),
  setTokenSearch: (value) => set({ tokenSearch: value }),
  setSelectOpen: (open) => set({ selectOpen: open }),
}));
