import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import {useMediaQuery} from "@/hooks/useMediaQuery.ts";

export default function WalletAssets({
  loading,
  tokenAccounts,
  setShowSend,
  setCurrentToken,
  mode,
  handleCloseAccount,
}: any) {
  const visibleAccounts =
    mode === "PRO"
      ? tokenAccounts
      : tokenAccounts.filter((token: any) => token.balance > 0);
  const { t } = useTranslation();

  return (
      <ScrollArea className="min-h-[20vh] h-[100vh] max-h-[65vh] pt-4 " >
      <div className="space-y-2 pb-[100px]">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
          : visibleAccounts.map((token: any) => (
              <div
                key={token.pubkey}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={token.metadata?.logoURI || ""}
                        alt={token.metadata?.symbol || "?"}
                      />
                      <AvatarFallback>
                        {token.metadata?.symbol?.slice(0, 2).toUpperCase() ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {token.metadata?.symbol || t("wallet.unknown")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(token.balance ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentToken(token);
                        setShowSend(true);
                      }}
                    >
                      {t("wallet.send")}
                    </Button>
                    {mode === "PRO" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCloseAccount(token)}
                            className="text-red-600"
                          >
                            {t("wallet.close")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </ScrollArea>
  );
}
