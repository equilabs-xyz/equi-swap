// TokenInputSection.tsx
import TokenSelector, { formatBalance } from "./TokenSelector";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useSwapStore } from "@/stores/swap-ui";
import { TokenInfo } from "@/types";

interface Props {
  label: string;
  token: TokenInfo | null;
  onSelect: (t: TokenInfo) => void;
  fieldName: "inputAmount" | "outputAmount";
  tokenBalances: Record<string, number>;
  topTokens: TokenInfo[];
  publicKey: string;
  allowMax?: boolean;
}

export default function TokenInputSection({
                                            label,
                                            token,
                                            onSelect,
                                            fieldName,
                                            tokenBalances,
                                            publicKey,
                                            allowMax = false,
                                          }: Props) {
  const { t } = useTranslation();

  const SOL_MINT = "11111111111111111111111111111111";
  const getBalanceForToken = (
      address: string,
      balances: Record<string, number>
  ): number => {
    const direct = balances[address];
    if (direct != null) return direct;
    if (address === SOL_MINT) {
      const solKey = Object.keys(balances).find((k) => k.startsWith("So"));
      if (solKey) return balances[solKey];
    }
    return 0;
  };

  const {
    inputAmount,
    outputAmount,
    setInputAmount,
    setOutputAmount,
    isOutputUpdating,
  } = useSwapStore();

  const value = fieldName === "inputAmount" ? inputAmount : outputAmount;
  const setValue = fieldName === "inputAmount" ? setInputAmount : setOutputAmount;

  return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{label}</span>
          <div className="flex items-center gap-2">
            {allowMax && token && (
                <>
              <span className="text-muted-foreground text-sm">
                {t("swap.balance")}:{" "}
                {formatBalance(
                    getBalanceForToken(token.address, tokenBalances),
                    token.decimals
                )}
              </span>
                  <button
                      className="text-primary hover:opacity-80 text-sm"
                      onClick={() => {
                        const bal = getBalanceForToken(token.address, tokenBalances);
                        setValue(bal.toFixed(token.decimals));
                      }}
                  >
                    {t("swap.max")}
                  </button>
                </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          <TokenSelector
              label=""
              selected={token}
              onSelect={onSelect}
              publicKey={publicKey}
          />
          <div className="w-full">
            {fieldName === "outputAmount" && isOutputUpdating ? (
                <Skeleton className="h-9 w-full rounded-md" />
            ) : (
                <Input
                    placeholder="0.0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    readOnly={fieldName === "outputAmount"}
                    className="text-right text-sm border-none bg-transparent focus-visible:ring-0"
                />
            )}
          </div>
        </div>
      </div>
  );
}
