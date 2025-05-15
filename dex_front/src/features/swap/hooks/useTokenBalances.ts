import { useEffect, useState, useCallback } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const CONNECTION_ENDPOINT = import.meta.env.VITE_SOLANA_RPC;

export function useTokenBalances(publicKey: PublicKey | null) {
  const [balances, setBalances] = useState<Record<string, number>>({});

  const fetchBalances = useCallback(async () => {
    if (!publicKey) return;
    const connection = new Connection(CONNECTION_ENDPOINT);

    const lamports = await connection.getBalance(publicKey);
    const solBalance = lamports / LAMPORTS_PER_SOL;

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
    );

    const updated: Record<string, number> = {
      ["11111111111111111111111111111111"]: solBalance,
    };

    tokenAccounts.value.forEach(({ account }) => {
      const info = account.data.parsed.info;
      const mint = info.mint;
      const uiAmount = info.tokenAmount.uiAmount;
      if (uiAmount != null) {
        updated[mint] = uiAmount;
      }
    });

    setBalances(updated);
  }, [publicKey]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    refetchBalances: fetchBalances,
  };
}
