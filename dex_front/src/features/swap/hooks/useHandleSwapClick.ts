import {
    VersionedTransaction,
    VersionedMessage,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwapStore } from "@/stores/swap-ui";
import { toast } from "sonner";

const JITO_BUNDLE_URL = " https://mainnet.block-engine.jito.wtf";

export const useHandleSwapClick = (
refetchBalances: () => Promise<void>) => {
    const { publicKey, signTransaction } = useWallet();
    const { transaction, arb_transaction, clearTransaction, clearArbTransaction } = useSwapStore();

    return async () => {
        if (!transaction || !arb_transaction || !publicKey || !signTransaction) {
            toast.error("Wallet or transaction missing");
            return;
        }

        let toastId: string | number | undefined;

        try {
            // Deserialize and sign user transaction (transaction)
            const unsignedTx = new VersionedTransaction(
                VersionedMessage.deserialize(Buffer.from(transaction, "base64"))
            );
            const signedTx = await signTransaction(unsignedTx);
            const signedTxBase64 = Buffer.from(signedTx.serialize()).toString("base64");


            console.log("Signed transaction:", signedTxBase64);

            console.log("Arb transaction:", arb_transaction);

            // const serializedTxBuffer = Buffer.from(arb_transaction, 'base64');

            // const txid = await connection.sendRawTransaction(serializedTxBuffer, {
            //     skipPreflight: true,
            //     preflightCommitment: 'confirmed',
            // });
            //
            // console.log(txid)

            toastId = toast.loading("Submitting Jito bundle...");

            // Send bundle
            const res = await fetch(JITO_BUNDLE_URL + "/api/v1/bundles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "sendBundle",
                    params: [
                        [signedTxBase64, arb_transaction],
                        {
                            encoding: "base64",
                        },
                    ],
                }),
            });

            const result = await res.json();
            console.log("Jito bundle response:", result);
            if (!res.ok || result.error) {
                const message = result?.error?.message || JSON.stringify(result);
                throw new Error("Jito bundle submission failed: " + message);
            }

            toast.success("Jito bundle sent!", {
                id: toastId,
                description: "Transactions submitted to Jito block engine.",
            });

            await refetchBalances();
        } catch (err) {
            console.error("❌ Jito bundle error:", err);
            toast.error("Swap failed", { id: toastId });
        } finally {
            clearTransaction();
            clearArbTransaction();
        }
    };
};
