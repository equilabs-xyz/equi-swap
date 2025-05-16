import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletAssetsTab from "./WalletAssetsTab";
import WalletTransactionsTab from "./WalletTransactionsTab";
import { useTranslation } from "react-i18next";
import {WalletTabsProps} from "@/types";

export default function WalletTabs({
  loading,
  tokenAccounts,
  setCurrentToken,
  setShowSend,
  mode,
  handleCloseAccount,
  address,
}: WalletTabsProps) {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue="assets" className="overflow-y-auto]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="assets">{t("wallet.assets")}</TabsTrigger>
        <TabsTrigger value="transactions">
          {t("wallet.transactions")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assets">
        <WalletAssetsTab
          loading={loading}
          tokenAccounts={tokenAccounts}
          setCurrentToken={setCurrentToken}
          setShowSend={setShowSend} // <-- add this
          mode={mode}
          handleCloseAccount={handleCloseAccount}
        />
      </TabsContent>

      <TabsContent value="transactions">
        <WalletTransactionsTab
          loading={loading}
          address={address}
        />{" "}
      </TabsContent>
    </Tabs>
  );
}
