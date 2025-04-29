import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function ReceiveDialog({ publicKey, open, setOpen }: any) {
  const { t } = useTranslation();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicKey);
    toast.success(t("wallet.copied"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[360px] p-6 text-center bg-zinc-900 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold mb-4">
            {t("wallet.receive")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-xl">
            <QRCode value={publicKey} size={160} />
          </div>
        </div>

        <div className="flex items-center justify-between bg-zinc-800 text-white text-xs px-4 py-2 rounded-xl">
          <div className="truncate max-w-[240px]">{publicKey}</div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-zinc-700"
            onClick={copyToClipboard}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
