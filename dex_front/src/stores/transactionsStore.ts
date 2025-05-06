import { create } from "zustand";

type Transaction = any; // Replace with your type
type Signature = string;

interface WalletCacheEntry {
  signatures: Signature[];
  transactions: Transaction[];
  timestamp: number;
}

interface TransactionsStore {
  walletAddress: string | null;
  cache: Record<string, WalletCacheEntry>;

  allSignatures: Signature[];
  loadedTransactions: Transaction[];
  loadCount: number;
  loading: boolean;
  error: string | null;

  // ⚙️ Wallet-aware caching
  setWallet: (address: string) => void;
  addTransactions: (wallet: string, sigs: Signature[], txs: Transaction[]) => void;
  getTransactions: (wallet: string, ttlMs?: number) => WalletCacheEntry | null;

  // Standard UI state setters
  setAllSignatures: (sigs: Signature[]) => void;
  setLoadedTransactions: (txs: Transaction[]) => void;
  setLoadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  walletAddress: null,
  cache: {},

  allSignatures: [],
  loadedTransactions: [],
  loadCount: 10,
  loading: false,
  error: null,

  setWallet: (address) => {
    const prev = get().walletAddress;
    if (prev !== address) {
      set({
        walletAddress: address,
        allSignatures: [],
        loadedTransactions: [],
        loadCount: 10,
      });
    }
  },

  addTransactions: (wallet, sigs, txs) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [wallet]: {
          signatures: sigs,
          transactions: txs,
          timestamp: Date.now(),
        },
      },
    }));
  },

  getTransactions: (wallet, ttlMs = 5 * 60 * 1000) => {
    const entry = get().cache[wallet];
    if (!entry) return null;
    const isFresh = Date.now() - entry.timestamp < ttlMs;
    return isFresh ? entry : null;
  },

  setAllSignatures: (sigs) => set({ allSignatures: sigs }),
  setLoadedTransactions: (txs) => set({ loadedTransactions: txs }),
  setLoadCount: (count) => set({ loadCount: count }),
  setLoading: (loading) => set({ loading }),
  setError: (err) => set({ error: err }),
}));
