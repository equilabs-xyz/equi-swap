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
  setInputToken: (token) => set({ inputToken: token }),
  setOutputToken: (token) => set({ outputToken: token }),
  swapTokens: () => {
    const { inputToken, outputToken } = get();
    set({ inputToken: outputToken, outputToken: inputToken });
  },
}));
