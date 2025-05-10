// swap/components/TokenInputSection.tsx
import TokenSelector, { formatBalance } from "./TokenSelector";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import {TokenInfo} from "@/types";


interface Props {
  label: string;
  token: TokenInfo | null;
  onSelect: (t: TokenInfo) => void;
  form: any;
  fieldName: string;
  tokenBalances: Record<string, number>;
  topTokens: TokenInfo[];
  publicKey: string;
  allowMax?: boolean;
}

export default function TokenInputSection({
  label,
  token,
  onSelect,
  form,
  fieldName,
  tokenBalances,
  // topTokens,
  publicKey,
  allowMax = false,
}: Props) {
  const { t } = useTranslation();

  // Edge‐case helper for native SOL balance lookup
  const SOL_MINT = "11111111111111111111111111111111";
  function getBalanceForToken(
    address: string,
    balances: Record<string, number>,
  ): number {
    const direct = balances[address];
    if (direct != null) return direct;
    if (address === SOL_MINT) {
      const solKey = Object.keys(balances).find((k) => k.startsWith("So"));
      if (solKey) return balances[solKey];
    }
    return 0;
  }

  return (
    <div className="space-y-2">
      {/* Header: Label + optional Balance/Max (only when allowMax) */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {allowMax && token && (
            <>
              <span className="text-muted-foreground text-sm">
                {t("swap.balance")}:{" "}
                {formatBalance(
                  getBalanceForToken(token.address, tokenBalances),
                  token.decimals,
                )}
              </span>
              <button
                className="text-primary hover:opacity-80 text-sm"
                onClick={() => {
                  const bal = getBalanceForToken(token.address, tokenBalances);
                  form.setValue(fieldName, bal.toFixed(token.decimals));
                }}
              >
                {t("swap.max")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body: Token selector + amount input */}
      <div className="flex items-center gap-2 w-full">
        <TokenSelector
          label=""
          selected={token}
          onSelect={onSelect}
          publicKey={publicKey}
          // balances={tokenBalances}
          // topTokens={topTokens}
        />
        <Form {...form}>
          <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="0.0"
                    className="text-right text-sm border-none bg-transparent focus-visible:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>
    </div>
  );
}