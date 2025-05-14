import {
    VersionedTransaction,
    Connection,
    Keypair, PublicKey, Transaction, SystemProgram,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwapStore } from "@/stores/swap-ui";

const JITO_BUNDLE_URL = "https://mainnet.block-engine.jito.wtf/api/v1/bundles";

async function sendJitoBundleJsonRpc(base64Txs: string[]) {
    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "sendBundle",
        params: [
            base64Txs,
            {
                encoding: "base64",
            },
        ],
    };

    const response = await fetch(JITO_BUNDLE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
        const message = result?.error?.message || JSON.stringify(result);
        throw new Error("Jito bundle submission failed: " + message);
    }

    console.log("🟢 Jito Bundle Result:", result.result);
}

export const useHandleSwapClick = (connection: Connection) => {
    const { publicKey, signTransaction } = useWallet();
    const { transaction, clearTransaction } = useSwapStore();

    return async () => {
        if (!transaction || !publicKey || !signTransaction) {
            console.warn("⚠️ Missing transaction or wallet");
            return;
        }

        try {
            const rawTx = Buffer.from(transaction, "base64");

            let tx: VersionedTransaction;
            try {
                tx = VersionedTransaction.deserialize(rawTx);
            } catch {
                throw new Error("❌ Failed to deserialize transaction");
            }

            const requiredSignatures = tx.message.header.numRequiredSignatures;
            while (tx.signatures.length < requiredSignatures) {
                tx.signatures.push(Buffer.alloc(64));
            }

            const isSigned = tx.signatures.some(
                (sig) => Buffer.compare(sig, Buffer.alloc(64)) !== 0
            );

            const finalTx = isSigned ? tx : await signTransaction(tx);

            const base64Tx = Buffer.from(finalTx.serialize()).toString("base64");

            // Create tip transaction
            const tipAccount = await getTipAccount();
            const payer = Keypair.generate(); // Replace with your actual payer Keypair
            const tipTx = await createTipTransaction(connection, payer, tipAccount);
            const base64TipTx = tipTx.serialize().toString("base64");

            // Submit bundle to Jito
            await sendJitoBundleJsonRpc([base64Tx, base64TipTx]);

            console.log("🚀 Sent to Jito relayer");
        } catch (err) {
            console.error("❌ Error during Jito bundle swap:", err);
        } finally {
            clearTransaction();
        }
    };
};



async function createTipTransaction(
    connection: Connection,
    payer: Keypair,
    tipAccount: PublicKey,
    tipAmountLamports: number = 100000
): Promise<Transaction> {
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const transaction = new Transaction({
        recentBlockhash,
        feePayer: payer.publicKey,
    });

    const transferInstruction = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: tipAccount,
        lamports: tipAmountLamports,
    });

    transaction.add(transferInstruction);
    transaction.sign(payer);

    return transaction;
}


async function getTipAccount(): Promise<PublicKey> {
    const response = await fetch("https://mainnet.block-engine.jito.wtf/api/v1/bundles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getTipAccounts",
            params: [],
        }),
    });

    const result = await response.json();
    const tipAccounts = result.result;
    if (!tipAccounts || tipAccounts.length === 0) {
        throw new Error("No Jito tip accounts available");
    }

    // Select a random tip account
    const randomIndex = Math.floor(Math.random() * tipAccounts.length);
    return new PublicKey(tipAccounts[randomIndex]);
}

