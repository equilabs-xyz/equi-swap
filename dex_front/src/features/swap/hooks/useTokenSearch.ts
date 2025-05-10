// stores/useTokenCache.ts
import { create } from "zustand";
import { TokenInfo } from "@/types";

interface TokenCacheState {
    allTokens: TokenInfo[] | null;
    lastFetched: number | null;
    setAllTokens: (tokens: TokenInfo[]) => void;
    clearCache: () => void;
}

export const useTokenCache = create<TokenCacheState>((set) => ({
    allTokens: null,
    lastFetched: null,
    setAllTokens: (tokens) =>
        set({ allTokens: tokens, lastFetched: Date.now() }),
    clearCache: () => set({ allTokens: null, lastFetched: null }),
}));
