import { create } from "zustand";
import { TokenInfo } from "@/data/token-list.ts";

type SwapState = {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
  setInputToken: (token: TokenInfo | null) => void;
  setOutputToken: (token: TokenInfo | null) => void;
  swapTokens: () => void;
};

export const useSwapStore = create<SwapState>((set, get) => ({
  inputToken: null,
  outputToken: null,
  setInputToken: (token) => {
    localStorage.setItem("swap.inputToken", JSON.stringify(token));
    set({ inputToken: token });
  },
  setOutputToken: (token) => {
    localStorage.setItem("swap.outputToken", JSON.stringify(token));
    set({ outputToken: token });
  },

  swapTokens: () => {
    const { inputToken, outputToken } = get();
    set({ inputToken: outputToken, outputToken: inputToken });
  },
}));
