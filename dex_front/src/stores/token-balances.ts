import { create } from "zustand";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const RPC_URL = import.meta.env.VITE_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

export type TokenBalancesStore = {
    balances: Record<string, number>;
    fetchBalances: (publicKey: PublicKey) => Promise<void>;
    clearBalances: () => void;
};

export const useTokenBalancesStore = create<TokenBalancesStore>((set) => ({
    balances: {},

    fetchBalances: async (publicKey: PublicKey) => {
        const connection = new Connection(RPC_URL, {commitment: "confirmed"});
        const updated: Record<string, number> = {};

        // Fetch SOL balance
        const lamports = await connection.getBalance(publicKey);
        updated["11111111111111111111111111111111"] = lamports / LAMPORTS_PER_SOL;

        // Fetch token balances
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { programId: TOKEN_PROGRAM_ID }
        );

        tokenAccounts.value.forEach(({ account }) => {
            const info = account.data.parsed.info;
            const mint = info.mint;
            const uiAmount = info.tokenAmount.uiAmount;
            if (uiAmount != null) {
                updated[mint] = uiAmount;
            }
        });

        set({ balances: updated });
    },

    clearBalances: () => {
        set({ balances: {} });
    },
}));
