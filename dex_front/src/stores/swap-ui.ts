import { create } from "zustand";
import { TokenInfo } from "@/types";

type SwapState = {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
  inputAmount: string;
  outputAmount: string;
  isOutputUpdating: boolean;
  transaction: string | null;
  arb_transaction: string | null;

  setInputToken: (token: TokenInfo | null) => void;
  setOutputToken: (token: TokenInfo | null) => void;
  setInputAmount: (val: string) => void;
  setOutputAmount: (val: string) => void;
  setIsOutputUpdating: (val: boolean) => void;

  setTransaction: (tx: string) => void;
  setArbTransaction: (tx: string) => void;
  clearTransaction: () => void;
  clearArbTransaction: () => void;

  swapTokens: () => void;
};

export const useSwapStore = create<SwapState>((set, get) => ({
  inputToken: null,
  outputToken: null,
  inputAmount: "",
  outputAmount: "",
  isOutputUpdating: false,
  transaction: null,
  arb_transaction: null,

  setInputToken: (token) => {
    localStorage.setItem("swap.inputToken", JSON.stringify(token));
    set({ inputToken: token });
  },
  setOutputToken: (token) => {
    localStorage.setItem("swap.outputToken", JSON.stringify(token));
    set({ outputToken: token });
  },
  setInputAmount: (val) => set({ inputAmount: val }),
  setOutputAmount: (val) => set({ outputAmount: val }),
  setIsOutputUpdating: (val) => set({ isOutputUpdating: val }),

  setTransaction: (tx) => set({ transaction: tx }),
  setArbTransaction: (tx) => set({ arb_transaction: tx }),
  clearTransaction: () => set({ transaction: null }),
  clearArbTransaction: () => set({ arb_transaction: null }),

  swapTokens: () => {
    const { inputToken, outputToken } = get();
    set({
      inputToken: outputToken,
      outputToken: inputToken,
    });
  },
}));
