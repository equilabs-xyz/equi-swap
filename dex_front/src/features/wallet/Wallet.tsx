// wallet/Wallet.tsx
import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletHeader from "./components/WalletHeader";
import WalletSendDialog from "./components/WalletSendDialog";
import { useWalletData } from "./hooks/useWalletData";
import { handleCloseAccount } from "@/features/wallet/services/handleCloseAccount.tsx";
import WalletTabs from "@/features/wallet/components/WalletTabs.tsx";
import WalletBalanceHeader from "./components/WalletBalance";
import WalletActions from "@/features/wallet/components/WalletActions.tsx";
import { ReceiveDialog } from "@/features/wallet/components/ReceiveDialog.tsx";
import { useSPLTokenAccountListeners } from "@/features/wallet/services/useSPLTokenAccountListeners.ts";
import { useNewTokenAccountListener } from "@/features/wallet/services/useNewTokenAccountListener.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletUIStore } from "@/stores/wallet-ui";
import {TokenAccount} from "@/types";
import {PublicKey} from "@solana/web3.js";
function useDebouncedCallback(callback: () => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  };
}

export default function WalletLayout() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const queryClient = useQueryClient();
  const hasFetchedRef = useRef(false);



  const {
    solBalance,
    tokenAccounts,
    transactions,
    loading,
    fetchData,
    setTokenAccounts,
    walletValue,
    solValue,

  } = useWalletData(publicKey);

  useEffect(() => {
    const key = `wallet-fetched-${publicKey?.toBase58()}`;
    if (publicKey && !localStorage.getItem(key)) {
      fetchData();
      localStorage.setItem(key, "1");
      hasFetchedRef.current = true;
    }
  }, [publicKey]);

  const debouncedInvalidate = useDebouncedCallback(() => {
    console.log("debouncedInvalidate");
      if (publicKey) {
          queryClient.invalidateQueries({ queryKey: ["wallet", publicKey.toBase58()] });
      }

  }, 1000);

  useSPLTokenAccountListeners({
    tokenAccounts,
    onAccountChange: () => {
      console.log("Account changed");
      debouncedInvalidate();
    },
  });

  useNewTokenAccountListener({
    publicKey,
    onNewAccount: () => {
      console.log("New acc changed");
      debouncedInvalidate();
    },
  });

  const {
    currentToken,
    showSend,
    showReceive,
    mode,
    setCurrentToken,
    setShowSend,
    setShowReceive,
  } = useWalletUIStore();

  useEffect(() => {
    if (!currentToken && showSend) {
        const solToken: TokenAccount | null =
            tokenAccounts.find((t: TokenAccount) => t.metadata?.symbol === "SOL") ?? null;

        setCurrentToken(solToken);
    }
  }, [showSend, currentToken, tokenAccounts]);
  if (!connected) {
    return (
        <div className="grid place-items-center h-screen px-4 text-center">
          <div className="space-y-2">
            <p className="text-lg font-medium">Wallet not connected.</p>
            <p className="text-sm text-muted-foreground">
              Please connect your wallet to view balances and manage assets.
            </p>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-2 space-y-4">
      <WalletHeader publicKey={publicKey} />
      <WalletBalanceHeader
        solBalance={solBalance}
        solValue={solValue}
        walletValue={walletValue}
      />
      <WalletActions
        publicKey={publicKey?.toBase58() ?? ""}
        onSendClick={() => setShowSend(true)}
        onReceiveClick={() => setShowReceive(true)}
      />

      <ReceiveDialog
        open={showReceive}
        setOpen={setShowReceive}
        publicKey={publicKey?.toBase58()}
      />

      <WalletTabs
        loading={loading}
        tokenAccounts={tokenAccounts}
        setCurrentToken={(token: TokenAccount) => {
          setCurrentToken(token);
          setShowSend(true);
        }}
        setShowSend={setShowSend}
        mode={mode}
        handleCloseAccount={(account: TokenAccount) =>
          handleCloseAccount({
              publicKey: publicKey!,
            tokenAccount: account,
            sendTransaction,
            setTokenAccounts,
          })
        }
        transactions={transactions}
        address={publicKey?.toBase58() ?? ""}
      />

      <WalletSendDialog
        open={showSend}
        setOpen={setShowSend}
        currentToken={currentToken}
        setCurrentToken={setCurrentToken}
        tokenAccounts={tokenAccounts}
        publicKey={publicKey as PublicKey}
        fetchData={fetchData}
      />
    </div>
  );
}
