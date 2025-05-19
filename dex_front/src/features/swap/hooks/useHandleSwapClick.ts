import {
    VersionedTransaction,
    VersionedMessage,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwapStore } from "@/stores/swap-ui";
import { toast } from "sonner";

const JITO_BUNDLE_URL = "https://mainnet.block-engine.jito.wtf";

async function pollBundleStatus(bundleId: string, toastId?: string | number): Promise<void> {
    const maxAttempts = 30;
    const delay = 1000;
    let attempts = 0;
    let seenEmptyCount = 0;
    const maxEmptyBeforeFail = 5;

    const waitingToastId = toast.loading("Waiting for confirmation... ⏳", { duration: Infinity });

    while (attempts < maxAttempts) {
        try {
            const res = await fetch(`${JITO_BUNDLE_URL}/api/v1/getBundleStatuses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getBundleStatuses",
                    params: [[bundleId]],
                }),
            });

            const data = await res.json();
            const value = data?.result?.value;

            if (!Array.isArray(value)) {
                toast.dismiss(waitingToastId);
                toast.error("Unexpected response from Jito", { id: toastId });
                return;
            }

            if (value.length === 0) {
                seenEmptyCount++;
                if (seenEmptyCount >= maxEmptyBeforeFail) {
                    toast.dismiss(waitingToastId);
                    toast.error("Swap failed: bundle not found", { id: toastId });
                    return;
                }
            } else {
                seenEmptyCount = 0;
                const bundle = value[0];
                const status = bundle?.confirmation_status;

                if (status === "confirmed" || status === "finalized") {
                    toast.dismiss(waitingToastId);
                    toast.success("Swap confirmed", {
                        id: toastId,
                        description: `Status: ${status}`,
                    });
                    return;
                }
            }
        } catch (err) {
            console.warn("Polling error (will retry)...", err);
        }

        await new Promise((res) => setTimeout(res, delay));
        attempts++;
    }

    toast.dismiss(waitingToastId);
    toast.error("Swap confirmation timeout", { id: toastId });
}


export const useHandleSwapClick = (
    refetchBalances: () => Promise<void>
) => {
    const { publicKey, signTransaction } = useWallet();
    const {
        transaction,
        arb_transaction,
        clearTransaction,
        clearArbTransaction,
    } = useSwapStore();

    return async () => {
        if (!transaction || !arb_transaction || !publicKey || !signTransaction) {
            toast.error("Wallet or transaction missing ️");
            return;
        }

        let toastId: string | number | undefined;

        try {
            const unsignedTx = new VersionedTransaction(
                VersionedMessage.deserialize(Buffer.from(transaction, "base64"))
            );

            const signedTx = await signTransaction(unsignedTx);
            const signedTxBase64 = Buffer.from(signedTx.serialize()).toString("base64");

            toastId = toast.loading("Submitting Jito bundle...");

            const res = await fetch(`${JITO_BUNDLE_URL}/api/v1/bundles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "sendBundle",
                    params: [[signedTxBase64, arb_transaction], { encoding: "base64" }],
                }),
            });

            const result = await res.json();
            console.log("Jito bundle response:", result);

            if (!res.ok || result.error) {
                const message = result?.error?.message || JSON.stringify(result);
                throw new Error("Jito bundle submission failed: " + message);
            }

            const bundleId = result?.result;
            if (typeof bundleId === "string") {
                await pollBundleStatus(bundleId, toastId);
            } else {
                toast.error("Swap sent but no bundle ID returned 🤔", { id: toastId });
            }

            await refetchBalances();
        } catch (err) {
            console.error("Jito bundle error:", err);
            toast.error("Jito overloaded. Try again", { id: toastId });
        } finally {
            clearTransaction();
            clearArbTransaction();
        }
    };
};
