// swap/components/Header.tsx
import { Button } from "@/components/ui/button";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import whiteLogo from "@/assets/white_logo.svg";
import { useTranslation } from "react-i18next";

export default function Header({
  connected,
  shortKey,
}: {
  connected: boolean;
  shortKey: string;
}) {
  const { setVisible } = useWalletModal();
  const { disconnect } = useWallet();
  const { t } = useTranslation();

  const handleConnect = () => setVisible(true);
  const handleDisconnect = () => disconnect();

  return (
    <div className="flex justify-between items-center">
      <img src={whiteLogo} className="invert dark:invert-[0] h-10 p-1" />

      {!connected ? (
        <Button onClick={handleConnect}>{t("wallet.connect")}</Button>
      ) : (
        <div className="flex items-center text-sm text-muted-foreground p-1 space-x-2">
          <span>
            {t("wallet.label")}: {shortKey}
          </span>
          <button
            onClick={handleDisconnect}
            aria-label={t("wallet.disconnect")}
            className="p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded rotate-180"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
