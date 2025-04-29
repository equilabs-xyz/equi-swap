import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";

interface TokenAccount {
  pubkey: string;
  [key: string]: any;
}

export const handleCloseAccount = async ({
  publicKey,
  tokenAccount,
  sendTransaction,
  setTokenAccounts,
}: {
  publicKey: PublicKey;
  tokenAccount: TokenAccount;
  sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>;
  setTokenAccounts: React.Dispatch<React.SetStateAction<TokenAccount[]>>;
}) => {
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

    setTokenAccounts((prev) =>
      prev.filter((acc) => acc.pubkey !== tokenAccount.pubkey),
    );
  } catch (error) {
    toast.error("Failed to close account", {
      id: toastId,
      description: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
