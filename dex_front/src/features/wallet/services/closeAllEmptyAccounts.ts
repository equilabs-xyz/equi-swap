// services/closeAllEmptyAccounts.ts
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
                                                sendTransaction,
                                            }: {
    publicKey: PublicKey;
    tokenAccounts: TokenAccount[];
    sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>;
}) {
    const connection = new Connection(import.meta.env.VITE_SOLANA_RPC);
    const toastId = toast.loading("Closing empty accounts...");

    try {
        const emptyAccounts = tokenAccounts.filter(
            (acc) => acc.balance === 0
        );

        if (emptyAccounts.length === 0) {
            toast.success("No empty accounts to close", {id: toastId});
            return;
        }

        for (const account of emptyAccounts) {
            const tx = new Transaction();
            const accountPubkey = new PublicKey(account.pubkey);

            const ix: TransactionInstruction = createCloseAccountInstruction(
                accountPubkey,
                publicKey,
                publicKey,
                [],
                TOKEN_PROGRAM_ID
            );

            tx.add(ix);

            const sig = await sendTransaction(tx, connection);
            await connection.confirmTransaction(sig, "confirmed");

            toast.success(`Closed account ${account.metadata?.symbol || ""}`, {
                description: `View transaction: https://solscan.io/tx/${sig}`
            });


            toast.dismiss(toastId);
        }
    } catch (err) {
        console.error("❌ Failed to close empty accounts", err);
        toast.error("Error closing accounts", {
            id: toastId,
            description: err instanceof Error ? err.message : "Unknown error",
        });
    }
}