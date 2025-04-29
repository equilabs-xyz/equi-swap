import { create } from "zustand";

interface Transaction {
  signature: string;
  amount: string;
  symbol: string;
  status: string;
  type: string;
  date: string;
  picture?: string;
}

interface TransactionsState {
  allSignatures: string[];
  loadedTransactions: Transaction[];
  loadCount: number;
  loading: boolean;
  error: string | null;
  setAllSignatures: (sigs: string[]) => void;
  setLoadedTransactions: (txs: Transaction[]) => void;
  setLoadCount: (count: number) => void;
  setLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  allSignatures: [],
  loadedTransactions: [],
  loadCount: 10,
  loading: false,
  error: null,
  setAllSignatures: (sigs) =>
    set({ allSignatures: sigs, loadCount: 10, loadedTransactions: [] }),
  setLoadedTransactions: (txs) => set({ loadedTransactions: txs }),
  setLoadCount: (count) => set({ loadCount: count }),
  setLoading: (val) => set({ loading: val }),
  setError: (err) => set({ error: err }),
  reset: () =>
    set({
      allSignatures: [],
      loadedTransactions: [],
      loadCount: 10,
      loading: false,
      error: null,
    }),
}));
