// swap/components/SwapButton.tsx
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function SwapButton({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation();

  return (
    <Button className="w-full" disabled={disabled}>
      {t("swap.button")}
    </Button>
  );
}
