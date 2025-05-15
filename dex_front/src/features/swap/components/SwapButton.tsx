// SwapButton.tsx
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useSwapStore } from "@/stores/swap-ui";
import {useTokenBalancesStore} from "@/stores/token-balances.ts";

export default function SwapButton({
                                     disabled,
                                     onClick,
                                   }: {
  disabled: boolean;
  onClick: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const { inputToken, inputAmount } = useSwapStore();
    const balances = useTokenBalancesStore((s) => s.balances);

  const inputMint = inputToken?.address;
  const inputBal = inputMint ? balances[inputMint] ?? 0 : 0;
  const inAmountNum = parseFloat(inputAmount || "0");
  const insufficient = inAmountNum > inputBal;

  const label = insufficient && inputToken
      ? `${t("swap.insufficient") || "Insufficient"} ${inputToken.symbol}`
      : t("swap.button");

  return (
      <Button
          className="w-full"
          disabled={disabled || insufficient}
          onClick={onClick}
      >
        {label}
      </Button>
  );
}
