import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";
import {CloseAccountParams} from "@/types";

export const handleCloseAccount = async ({
  publicKey,
  tokenAccount,
  sendTransaction,
}: CloseAccountParams) => {
  const toastId = toast.loading("Closing account...");
  try {
    const connection = new Connection(import.meta.env.VITE_SOLANA_RPC);
    const tx = new Transaction();
    const accountPubkey = new PublicKey(tokenAccount.pubkey);

    tx.add(
      createCloseAccountInstruction(
        accountPubkey,
        publicKey,
        publicKey,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");

    toast.success("Account closed successfully", {
      id: toastId,
      description: (
        <a
          href={`https://solscan.io/tx/${signature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View transaction
        </a>
      ),
    });



  } catch (error) {
    toast.error("Failed to close account", {
      id: toastId,
      description: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
