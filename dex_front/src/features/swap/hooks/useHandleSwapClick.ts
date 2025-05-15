import {
    VersionedTransaction,
    VersionedMessage,
    Connection,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwapStore } from "@/stores/swap-ui";
import { toast } from "sonner";

// ✅ Remove the hook call here (no useTokenBalances)

export const useHandleSwapClick = (
    connection: Connection,
    refetchBalances: () => Promise<void> // passed from parent
) => {
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    const { transaction, clearTransaction } = useSwapStore();

    return async () => {
        if (!transaction || !publicKey || !signTransaction || !sendTransaction) {
            console.warn("⚠️ Missing transaction or wallet");
            toast.error("Wallet or transaction is missing");
            return;
        }

        let toastId: string | number | undefined;

        try {
            const rawMessage = Buffer.from(transaction, "base64");

            let tx: VersionedTransaction;
            try {
                const message = VersionedMessage.deserialize(rawMessage);
                tx = new VersionedTransaction(message);
            } catch (e) {
                console.error("❌ Failed to deserialize message", e);
                toast.error("Failed to decode transaction");
                return;
            }

            const sig = await sendTransaction(tx, connection);
            console.log("🚀 Swap transaction sent:", sig);

            // ✅ Create and store toast ID
            toastId = toast.loading("Awaiting confirmation...");

            // Wait for confirmation
            await connection.confirmTransaction(sig, "confirmed");

            toast.success("Swap confirmed!", {
                id: toastId,
                description: `<a href="https://solscan.io/tx/${sig}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #3b82f6;">View on Explorer</a>`
            });

            // ✅ Refresh balances
            await refetchBalances();

        } catch (err) {
            console.error("❌ Error during swap execution:", err);
            toast.error("Swap failed.", { id: toastId });
        } finally {
            clearTransaction();
        }
    };
};
