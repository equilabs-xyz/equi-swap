import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CopyIcon } from "lucide-react";
import { useWalletUIStore } from "@/stores/wallet-ui";
import { useTranslation } from "react-i18next";
import {toast} from "sonner";
import {PublicKey} from "@solana/web3.js";
interface WalletHeaderProps {
  publicKey: PublicKey | null;

}
export default function WalletHeader( { publicKey}: WalletHeaderProps) {
  const { mode, setMode } = useWalletUIStore();
  const { t } = useTranslation();

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toString());
    toast.success(t("wallet.copied"));
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{t("wallet.title")}</h2>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v: "BASIC" | "PRO") => setMode(v)}
        >
          <ToggleGroupItem value="BASIC">{t("wallet.basic")}</ToggleGroupItem>
          <ToggleGroupItem value="PRO">{t("wallet.pro")}</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {publicKey && (
        <Button onClick={copyAddress} variant="outline" size="sm">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          <CopyIcon className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
