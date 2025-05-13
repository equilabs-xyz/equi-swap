// SwapButton.tsx
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useSwapStore } from "@/stores/swap-ui";
import { useTokenBalances } from "@/features/swap/hooks/useTokenBalances";
import { useWallet } from "@solana/wallet-adapter-react";

export default function SwapButton({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const { inputToken, inputAmount } = useSwapStore();
  const { balances } = useTokenBalances(publicKey);

  const inputMint = inputToken?.address;
  const inputBal = inputMint ? balances[inputMint] ?? 0 : 0;
  const inAmountNum = parseFloat(inputAmount || "0");
  const insufficient = inAmountNum > inputBal;

  const label = insufficient && inputToken
      ? `${t("swap.insufficient") || "Insufficient"} ${inputToken.symbol}`
      : t("swap.button");

  return (
      <Button className="w-full" disabled={disabled || insufficient}>
        {label}
      </Button>
  );
}
