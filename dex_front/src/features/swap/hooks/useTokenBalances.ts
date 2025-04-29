// swap/hooks/useTokenBalances.ts
import { useEffect, useState } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenInfo } from "@/data/token-list";
import { TopTokens } from "@/data/top-tokens";

const CONNECTION_ENDPOINT = import.meta.env.VITE_SOLANA_RPC;

export function useTokenBalances(publicKey: PublicKey | null) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [topTokens, setTopTokens] = useState<TokenInfo[]>(TopTokens);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;

      const connection = new Connection(CONNECTION_ENDPOINT);
      const solBalance =
        (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
      );

      const updatedBalances: Record<string, number> = {
        So11111111111111111111111111111111111111112: solBalance,
      };

      tokenAccounts.value.forEach(({ account }) => {
        const info = account.data.parsed.info;
        updatedBalances[info.mint] = info.tokenAmount.uiAmount;
      });

      setBalances(updatedBalances);

      setTopTokens(
        TopTokens.map((token) => ({
          ...token,
          balance: updatedBalances[token.address] || 0,
        })),
      );
    };

    fetchBalances();
  }, [publicKey]);

  return { balances, topTokens };
}
