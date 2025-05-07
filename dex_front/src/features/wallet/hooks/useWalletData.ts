import { useEffect, useCallback } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSignatures, fetchTransactionsBySignatures } from "@/features/wallet/services/solana.ts";
import { useTransactionsStore } from "@/stores/transactionsStore.ts";
import {
  RawWalletApiResult,
  RawWalletToken,
  TokenAccount,
  WalletData,
} from "@/types";

const API_ENDPOINT = "/api/wallet";

export function useWalletData(publicKey?: PublicKey | null) {
  const walletKey = publicKey?.toBase58();
  const queryClient = useQueryClient();
  const {
    setAllSignatures,
    setLoadedTransactions,
  } = useTransactionsStore();

  // ✅ Fetch wallet balances and metadata (fast)
  const fetchWalletData = async (): Promise<WalletData | null> => {
    if (!walletKey) return null;

    const response = await fetch(`${API_ENDPOINT}?address=${walletKey}`);
    const result: RawWalletApiResult = await response.json();
    const data = result.result;

    const solToken = data.tokens.find((t) => t.symbol === "SOL");

    const accounts: TokenAccount[] = data.tokens.map((token: RawWalletToken) => ({
      pubkey: token.accounts?.[0]?.pubkey || "",
      mint: token.mint,
      balance: token.totalUiAmount,
      decimals: token.decimals,
      metadata: {
        name: token.name,
        symbol: token.symbol,
        logoURI: token.imageUri,
        decimals: token.decimals,
      },
      swappable: token.swappable || false,
      price: token.price || null,
      verified: token.verified || false,
      actions: token.actions || [],
    }));

    return {
      solBalance: solToken?.totalUiAmount || 0,
      tokenAccounts: accounts,
      walletValue: { total: data.value || 0 },
      solValue: { total: data.solValue || 0 },
      onrampTokenId: data.onrampTokenId || null,
      offrampTokenId: data.offrampTokenId || null,
    };
  };

  // ✅ Fire immediately on mount
  const { data: walletData, isLoading } = useQuery<WalletData | null>({
    queryKey: ["wallet", walletKey],
    queryFn: fetchWalletData,
    enabled: !!walletKey,
    staleTime: Infinity,
    retry: false,
  });

  // ✅ Independent transaction loader (non-blocking)
  const fetchInitialTransactions = useCallback(async () => {
    if (!walletKey) return [];

    try {
      const signatures = await fetchSignatures(walletKey);
      setAllSignatures(signatures);

      const firstChunk = signatures.slice(0, 10);
      if (firstChunk.length > 0) {
        const transactions = await fetchTransactionsBySignatures(walletKey, firstChunk);
        setLoadedTransactions(transactions);
        return transactions;
      }
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      toast.error("Failed to fetch transactions");
    }

    return [];
  }, [walletKey, setAllSignatures, setLoadedTransactions]);

  useEffect(() => {
    if (walletKey) {
      fetchInitialTransactions();
    }
  }, [walletKey, fetchInitialTransactions]);

  // 🔄 Clean disconnect state
  useEffect(() => {
    if (!publicKey) {
      const last = localStorage.getItem("last-connected-pubkey");
      if (last) localStorage.removeItem(`wallet-fetched-${last}`);
    } else {
      localStorage.setItem("last-connected-pubkey", publicKey.toBase58());
    }
  }, [publicKey]);

  // 🔁 Invalidation for refresh
  const invalidateWalletData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["wallet", walletKey] });
  }, [queryClient, walletKey]);

  const setTokenAccounts = useCallback(
      (next: TokenAccount[]) => {
        queryClient.setQueryData<WalletData | null>(
            ["wallet", walletKey],
            (old) => (old ? { ...old, tokenAccounts: next } : null),
        );
      },
      [queryClient, walletKey],
  );

  return {
    solBalance: walletData?.solBalance ?? 0,
    tokenAccounts: walletData?.tokenAccounts ?? [],
    walletValue: walletData?.walletValue ?? null,
    solValue: walletData?.solValue ?? null,
    onrampTokenId: walletData?.onrampTokenId ?? null,
    offrampTokenId: walletData?.offrampTokenId ?? null,
    loading: isLoading,
    fetchData: () => invalidateWalletData(),
    invalidateWalletData,
    fetchInitialTransactions,
    setTokenAccounts,
  };
}
