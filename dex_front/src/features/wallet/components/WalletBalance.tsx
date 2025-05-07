import { Eye, EyeOff } from "lucide-react";
import { useWalletUIStore } from "@/stores/wallet-ui.ts";
import { useTranslation } from "react-i18next";

export default function WalletBalanceHeader({
  solBalance,
  solValue,
  walletValue,
}: {
  solBalance: number;
  solValue: any;
  walletValue: any;
}) {
  const { showBalance, setShowBalance, showUsd, setShowUsd } =
    useWalletUIStore();
  const { t } = useTranslation();


  const usdTotal = walletValue?.total?.total ?? 0;


  const solTotal = solValue?.total?.total ?? 0;

  const displayed = showUsd ? usdTotal : solTotal;

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <p
          className="text-muted-foreground cursor-pointer"
          onClick={() => setShowUsd(!showUsd)}
        >
          {showUsd
            ? `${t("wallet.totalbalance")} (USD)`
            : `${t("wallet.totalbalance")} (SOL)`}{" "}
        </p>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="text-muted-foreground"
        >
          {showBalance ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="text-2xl font-bold">
        {showBalance
          ? showUsd
            ? `$${displayed.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`
            : `${displayed.toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })} SOL`
          : "••••••"}
      </p>
    </div>
  );
}
