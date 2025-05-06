import { useQuery } from "@tanstack/react-query";
import { TokenInfo } from "@/types";

const normalize = (t: any, fromWallet: boolean): TokenInfo => ({
    name: t.name,
    symbol: t.symbol,
    address: t.mint || t.address,
    logoURI: t.imageUri,
    decimals: t.decimals,
    balance: fromWallet
        ? t.totalUiAmount ?? 0
        : t.balance ?? t.totalUiAmount ?? 0,
    verified: t.verified ?? false,
});

export function useWalletTokens(publicKey?: string) {
    return useQuery<TokenInfo[]>({
        queryKey: ["walletTokens", publicKey],
        queryFn: async () => {
            if (!publicKey) return [];
            const res = await fetch(`/api/wallet?address=${encodeURIComponent(publicKey)}`).then(r => r.json());
            const tokens: any[] = res.result?.tokens ?? [];
            return tokens.filter(t => t.swappable).map(t => normalize(t, true));
        },
        enabled: !!publicKey,
        staleTime: 5 * 60 * 1000,
    });
}

export function useAllTokens(search = "") {
    return useQuery<TokenInfo[]>({
        queryKey: ["allTokens", search],
        queryFn: async () => {
            const res = await fetch(`/api/searchToken?query=${encodeURIComponent(search)}`).then(r => r.json());
            const tokens: any[] = res.tokens ?? [];
            return tokens.filter(t => t.swappable).map(t => normalize(t, false));
        },
        staleTime: 5 * 60 * 1000,
    });
}
