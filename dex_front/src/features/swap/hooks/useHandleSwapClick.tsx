import {
    VersionedTransaction,
    VersionedMessage,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSwapStore } from "@/stores/swap-ui";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settingsStore.ts";

const JITO_BUNDLE_URLS = [
    "https://mainnet.block-engine.jito.wtf",
    "https://amsterdam.mainnet.block-engine.jito.wtf",
    "https://frankfurt.mainnet.block-engine.jito.wtf",
    "https://london.mainnet.block-engine.jito.wtf",
    "https://ny.mainnet.block-engine.jito.wtf",
    "https://tokyo.mainnet.block-engine.jito.wtf",
    "https://slc.mainnet.block-engine.jito.wtf",
];

export const useHandleSwapClick = (
    refetchBalances: () => Promise<void>
) => {
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    const {
        transaction,
        arb_transaction,
        clearTransaction,
        clearArbTransaction,
    } = useSwapStore();
    const useJito = useSettingsStore(s => s.useJito);
    const { connection } = useConnection();

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

            // const signedTx = await signTransaction(unsignedTx);
            // const signedTxBase64 = Buffer.from(signedTx.serialize()).toString("base64");

            if (useJito) {
                toastId = toast.loading("Submitting Jito bundle...");
                const signedTx = await signTransaction(unsignedTx);
                const signedTxBase64 = Buffer.from(signedTx.serialize()).toString("base64");
                let result;
                try {
                    result = await submitToAllJitoEndpoints(signedTxBase64, arb_transaction);
                } catch (e) {
                    console.error("Jito submission failed:", e);
                    throw new Error("Failed to submit bundle to all Jito endpoints");
                }


                if (typeof result.bundleId === "string") {
                    await pollBundleStatus(result.bundleId, result.url, toastId);
                } else {
                    toast.error("Swap sent but no bundle ID returned", { id: toastId });
                }
            } else {
                toastId = toast.loading("Sending transaction...");
                const txSig = await sendTransaction(unsignedTx, connection);
                toast.success("Transaction sent", {
                    id: toastId,
                    description: (
                        <a
                            href={`https://solscan.io/tx/${txSig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
                    >
                    View transaction
                </a>
            ),
                });
            }

            await refetchBalances();
        } catch (err) {
            console.error("Swap error:", err);
            toast.error("Swap failed. Check logs or try again", { id: toastId });
        } finally {
            clearTransaction();
            clearArbTransaction();
        }
    };
};

async function submitToAllJitoEndpoints(signedTxBase64: string, arb_transaction: string) {
    const attempts = JITO_BUNDLE_URLS.map(async (url) => {
        try {
            const res = await fetch(`${url}/api/v1/bundles`, {
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
            if (res.ok && !result.error) {
                return { url, bundleId: result.result };
            } else {
                console.warn(`Jito failed @ ${url}`, result?.error || res.statusText);
                return null;
            }
        } catch (err) {
            console.warn(`Jito threw @ ${url}`, err);
            return null;
        }
    });

    const responses = await Promise.allSettled(attempts);
    for (const r of responses) {
        if (r.status === "fulfilled" && r.value) {
            return r.value; // Return first success
        }
    }

    throw new Error("All Jito endpoints failed");
}

async function pollBundleStatus(
    bundleId: string,
    jitoUrl: string,
    toastId?: string | number
): Promise<void> {
    const maxAttempts = 30;
    const delay = 1000;
    let attempts = 0;
    let seenEmptyCount = 0;
    const maxEmptyBeforeFail = 5;

    const waitingToastId = toast.loading("Waiting for confirmation... ", { duration: Infinity });

    while (attempts < maxAttempts) {
        try {
            const res = await fetch(`${jitoUrl}/api/v1/getBundleStatuses`, {
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
                console.log(bundle)

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
