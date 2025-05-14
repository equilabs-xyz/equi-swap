import { Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwapStore } from "@/stores/swap-ui";

const JITO_BUNDLE_URL = "https://your-jito-relayer.com/v1/bundles"; // replace with your endpoint

export const useHandleSwapClick = (connection: any) => {
  const { publicKey, signTransaction } = useWallet();
  const { transaction, clearTransaction } = useSwapStore();

  return async () => {
    if (!transaction || !publicKey || !signTransaction) {
      console.warn("Missing transaction or wallet");
      return;
    }

    try {
      const rawTx = Buffer.from(transaction, "base64");
      const tx = Transaction.from(rawTx);

      // If partially signed, finish signing client-side
      if (!tx.signatures.find((sig) => sig.publicKey.equals(publicKey))) {
        console.log("Signing bundle transaction with wallet...");
        const signedTx = await signTransaction(tx);
        const serialized = signedTx.serialize().toString("base64");

        await submitJitoBundle(serialized, publicKey.toBase58(), connection);
      } else {
        console.log("Already signed by wallet or backend");
        await submitJitoBundle(transaction, publicKey.toBase58(), connection);
      }

      clearTransaction();
    } catch (err) {
      console.error("Error handling swap click / bundle:", err);
    }
  };
};

export async function submitJitoBundle(
  base64Tx: string,
  signer: string,
  connection: any
) {
  const currentSlot = await connection.getSlot();
  const response = await fetch(JITO_BUNDLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      signer,
      bundle: [base64Tx],
      tip: 10000, // lamports
      simulate: false,
      bundleTarget: {
        slot: currentSlot + 2,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error("Jito bundle submission failed: " + error);
  }

  const res = await response.json();
  console.log("Jito bundle submitted:", res);
}
