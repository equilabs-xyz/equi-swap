export async function fetchTokenMetadata(mintAddress: string) {
  try {
    const response = await fetch(
      `/api/searchTokensByMint?query=${mintAddress}`,
    );
    const data = await response.json();
    return data.success ? data.result : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchSignatures(publicKey: string): Promise<string[]> {
  const response = await fetch("/api/signatures", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: publicKey, limit: 0 }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transaction signatures");
  }

  const data = await response.json();
  return data.signatures || [];
}

export async function fetchTransactionsBySignatures(
  publicKey: string,
  signatures: string[],
) {
  const response = await fetch("/api/fetchTransactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: publicKey,
      signatures: signatures,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch parsed transactions");
  }

  const data = await response.json();
  return data.results
    .filter((tx: any) => typeof tx.timestamp === "number")
    .sort((a: any, b: any) => b.timestamp - a.timestamp) // 👈 sort by timestamp DESC
    .map((tx: any) => {
      const amount = parseFloat(
        tx.interactionData.balanceChanges[0]?.amount || "0",
      );
      const symbol =
        tx.interactionData.balanceChanges[0]?.token?.symbol || "Unknown";

      return {
        picture: tx.interactionData.balanceChanges[0]?.token?.logoURI,
        amount,
        symbol,
        timestamp: tx.timestamp,
        signature: tx.chainMeta.transactionId,
        type: tx.interactionData.transactionType,
        status: tx.chainMeta.status === "success" ? "Confirmed" : "Failed",
      };
    });
}

export async function fetchTransactionHistory(publicKey: string) {
  const response = await fetch("http://localhost:7777/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accounts: [{ chainId: "solana:101", address: publicKey }],
    }),
  });

  if (!response.ok) throw new Error("Transaction history failed");

  const data = await response.json();

  return data.results
    .filter((tx: any) => typeof tx.timestamp === "number")
    .sort((a: any, b: any) => b.timestamp - a.timestamp) // 👈 sort by timestamp DESC
    .map((tx: any) => {
      const amount = parseFloat(
        tx.interactionData.balanceChanges[0]?.amount || "0",
      );
      const symbol =
        tx.interactionData.balanceChanges[0]?.token?.symbol || "Unknown";

      return {
        picture: tx.interactionData.balanceChanges[0]?.token?.logoURI,
        amount,
        symbol,
        date: new Date(tx.timestamp * 1000).toLocaleString(),
        signature: tx.chainMeta.transactionId,
        type: tx.interactionData.transactionType,
        status: tx.chainMeta.status === "success" ? "Confirmed" : "Failed",
      };
    });
}
