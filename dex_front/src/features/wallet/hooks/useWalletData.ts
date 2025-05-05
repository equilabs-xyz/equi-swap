import { useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSignatures,
  fetchTransactionsBySignatures,
} from "@/features/wallet/services/solana.ts";
import { useTransactionsStore } from "@/stores/transactionsStore.ts";
import {RawWalletApiResult, RawWalletToken, TokenAccount, WalletData} from "@/types";

const API_ENDPOINT = "/api/wallet";


export function useWalletData(publicKey?: PublicKey | null) {
  const queryClient = useQueryClient();
  const walletKey = publicKey?.toBase58();
  const { setAllSignatures, setLoadedTransactions } = useTransactionsStore();

  const fetchWalletData = async (): Promise<WalletData | null> => {
    console.log("Fetching wallet data for", walletKey);
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

  const fetchInitialTransactions = useCallback(async () => {
    console.log("Fetching initial transactions for", walletKey);
    if (!walletKey) return;

    try {
      const sigs = await fetchSignatures(walletKey);
      setAllSignatures(sigs);

      const firstChunk = sigs.slice(0, 10);
      if (firstChunk.length > 0) {
        const txs = await fetchTransactionsBySignatures(walletKey, firstChunk);
        setLoadedTransactions(txs);
      }
    } catch (e) {
      console.error("Failed to fetch initial transactions", e);
      toast.error("Failed to fetch transactions");
    }
  }, [walletKey, setAllSignatures, setLoadedTransactions]);

  // Wallet balances
  const { data: walletData, isLoading } = useQuery<WalletData | null>({
    queryKey: ["wallet", walletKey],
    queryFn: fetchWalletData,
    enabled: !!walletKey,
    staleTime: Infinity,
    retry: false,
  });

  // Transactions via fetchTransactionHistory
  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ["transactions", walletKey],
    queryFn: async () => {
      if (!walletKey) return; // ❌ returns `undefined`
      const txs = await fetchInitialTransactions();
      return txs;
    },
    enabled: !!walletKey,
    staleTime: Infinity,
    retry: false,
  });

  // Clean disconnect state
  useEffect(() => {
    if (!publicKey) {
      const last = localStorage.getItem("last-connected-pubkey");
      if (last) localStorage.removeItem(`wallet-fetched-${last}`);
    } else {
      localStorage.setItem("last-connected-pubkey", publicKey.toBase58());
    }
  }, [publicKey]);

  // Invalidation for manual refreshes
  const invalidateWalletData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["wallet", walletKey] });
  }, [queryClient, walletKey]);

  const invalidateTransactions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions", walletKey] });
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
    loading: isLoading || isTxLoading,
    transactions, // ✅ expose fetched txs
    fetchData: () => invalidateWalletData(),
    invalidateWalletData,
    invalidateTransactions, // ✅ manual refresh
    fetchInitialTransactions,
    setTokenAccounts,
  };
}
