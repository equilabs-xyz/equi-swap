import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,

} from "@solana/web3.js";
import {
    createCloseAccountInstruction,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";
import { TokenAccount } from "@/types";

export async function closeAllEmptyAccounts({
                                                publicKey,
                                                tokenAccounts,
                                                signAllTransactions,
                                            }: {
    publicKey: PublicKey;
    tokenAccounts: TokenAccount[];
    signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
}) {
    const connection = new Connection(import.meta.env.VITE_SOLANA_RPC);
    const toastId = toast.loading("Preparing to close empty accounts...");

    try {
        const emptyAccounts = tokenAccounts.filter((acc) => acc.balance === 0);

        if (emptyAccounts.length === 0) {
            toast.success("No empty accounts to close", { id: toastId });
            return;
        }

        const transactions: Transaction[] = emptyAccounts.map((account) => {
            const tx = new Transaction();
            const accountPubkey = new PublicKey(account.pubkey);

            const ix: TransactionInstruction = createCloseAccountInstruction(
                accountPubkey,
                publicKey, // destination (lamports go here)
                publicKey, // authority
                [],
                TOKEN_PROGRAM_ID
            );

            tx.add(ix);
            tx.feePayer = publicKey;
            tx.recentBlockhash = ""; // to be filled later
            return tx;
        });

        const { blockhash } = await connection.getLatestBlockhash();
        transactions.forEach((tx) => {
            tx.recentBlockhash = blockhash;
        });
        const signedTxs = await signAllTransactions(transactions);

        for (let i = 0; i < signedTxs.length; i++) {
            const signedTx = signedTxs[i];
            const rawTx = signedTx.serialize();
            const sig = await connection.sendRawTransaction(rawTx);
            await connection.confirmTransaction(sig, "confirmed");

            toast.success(`Closed account ${emptyAccounts[i].metadata?.symbol || ""}`, {
                description: `View transaction: https://solscan.io/tx/${sig}`,
            });
        }

        toast.success("All empty accounts closed", { id: toastId });

    } catch (err) {
        console.error("❌ Failed to close empty accounts", err);
        toast.error("Error closing accounts", {
            id: toastId,
            description: err instanceof Error ? err.message : "Unknown error",
        });
    }
}
