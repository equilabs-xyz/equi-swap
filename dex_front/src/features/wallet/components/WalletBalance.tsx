import { Eye, EyeOff, Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useWalletUIStore } from "@/stores/wallet-ui.ts";
import { useTranslation } from "react-i18next";
import CloseEmptyAccountsButton from "@/features/wallet/components/CloseEmptyAccountsButton";
import {TokenAccount} from "@/types";
import {PublicKey, Transaction} from "@solana/web3.js";

export default function WalletBalanceHeader({
                                              solBalance,
                                              solValue,
                                              walletValue,
                                              publicKey,
                                              tokenAccounts,
                                              sendTransaction,
                                                signAllTransactions
                                            }: {
  solBalance: number;
  solValue: any;
  walletValue: any;
  publicKey: PublicKey;
  tokenAccounts: TokenAccount[];
  sendTransaction: (tx: any, connection: any) => Promise<string>;
    signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;

}) {
  const { showBalance, setShowBalance, showUsd, setShowUsd, mode } = useWalletUIStore();
  const { t } = useTranslation();

  const usdTotal = walletValue?.total?.total ?? 0;
  const solTotal = solValue?.total?.total ?? 0;
  const displayed = showUsd ? usdTotal : solTotal;

  return (
      <div className="flex justify-between items-start w-full">
        <div>
          <div className="flex items-center gap-2">
            <p
                className="text-muted-foreground cursor-pointer"
                onClick={() => setShowUsd(!showUsd)}
            >
              {showUsd ? `${t("wallet.totalbalance")} (USD)` : `${t("wallet.totalbalance")} (SOL)`}
            </p>

            <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            {/* PRO-only gear icon with dropdown */}
            {mode && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Settings2 className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit p-2 rounded-md border bg-popover">
                      <CloseEmptyAccountsButton
                          publicKey={publicKey!}
                          tokenAccounts={tokenAccounts}
                          sendTransaction={sendTransaction}
                          signAllTransactions={signAllTransactions} // ✅ pass here
                      />

                  </PopoverContent>
                </Popover>
            )}
          </div>

          <p className="text-2xl font-bold">
            {showBalance
                ? showUsd
                    ? `$${displayed.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : `${displayed.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`
                : "••••••"}
          </p>
        </div>
      </div>
  );
}
