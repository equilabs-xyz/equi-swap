import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletAssetsTab from "./WalletAssetsTab";
import WalletTransactionsTab from "./WalletTransactionsTab";
import { useTranslation } from "react-i18next";

export default function WalletTabs({
  loading,
  tokenAccounts,
  setCurrentToken,
  setShowSend,
  mode,
  handleCloseAccount,
  transactions,
  address,
}: any) {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue="assets" className="space-y-4">
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
          transactions={transactions}
          address={address}
        />{" "}
      </TabsContent>
    </Tabs>
  );
}
