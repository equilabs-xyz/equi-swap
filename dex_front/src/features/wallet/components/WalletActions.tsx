import { QrCode, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WalletActions({
  publicKey,
  onSendClick,
  onReceiveClick,
}: {
  publicKey: string;
  onSendClick: () => void;
  onReceiveClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-left gap-4 border-b pb-4">
      <button
        onClick={onSendClick}
        className="bg-white text-black px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-md"
      >
        <ArrowUpRight className="w-3 h-3" />
        {t("wallet.send")}
      </button>
      <button
        onClick={onReceiveClick}
        className="bg-white text-black px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-md"
      >
        <QrCode className="w-3 h3" />
        {t("wallet.receive")}
      </button>
    </div>
  );
}
