import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { toast } from "sonner"; // or your preferred toast system

export default function WalletAssets({
                                       loading,
                                       tokenAccounts = [],
                                       setShowSend,
                                       setCurrentToken,
                                       mode,
                                       handleCloseAccount,
                                     }: any) {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const PRIORITY_MINTS = [
    "So11111111111111111111111111111111111111112", // WSOL
    "Es9vMFrzaCERB1g4WxZzWxYGZ8gB5wus8FfLBaFz5rs", // USDT
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "11111111111111111111111111111111",
  ];

  const visibleAccounts = (
      mode === "PRO"
          ? tokenAccounts
          : tokenAccounts.filter((token: any) => token.balance > 0)
  ).sort((a: any, b: any) => {
    const aPriority = PRIORITY_MINTS.includes(a.mint) ? 1 : 0;
    const bPriority = PRIORITY_MINTS.includes(b.mint) ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;

    const aSwappable = a.swappable ? 1 : 0;
    const bSwappable = b.swappable ? 1 : 0;
    if (aSwappable !== bSwappable) return bSwappable - aSwappable;

    return (b.balance ?? 0) - (a.balance ?? 0);
  });

  const tryCloseAccount = (token: any) => {
    if ((token.balance ?? 0) > 0) {
      toast.error(t("wallet.error_nonzero_balance") || "Balance must be zero to close account");
      return;
    }

    handleCloseAccount(token);
    setOpenMenu(null);
  };

  return (
      <ScrollArea className="min-h-[20vh] h-[100vh] max-h-[65vh] pt-4">
        <div className="space-y-2 pb-[100px]">
          {loading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))
              : visibleAccounts.map((token: any) => {
                const isMenuOpen = openMenu === token.pubkey;

                return (
                    <div
                        key={token.pubkey}
                        className="relative rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                                src={token.metadata?.logoURI || ""}
                                alt={token.metadata?.symbol || "?"}
                            />
                            <AvatarFallback>
                              {token.metadata?.symbol?.slice(0, 2).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-none">
                              {token.metadata?.symbol || t("wallet.unknown")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(token.balance ?? 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 relative">
                          <Button
                              variant="ghost"
                              size="sm"
                              className="px-2 text-sm"
                              onClick={() => {
                                setCurrentToken(token);
                                setShowSend(true);
                              }}
                          >
                            {t("wallet.send")}
                          </Button>
                          {mode === "PRO" && (
                              <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 p-0"
                                    onClick={() =>
                                        setOpenMenu((prev) =>
                                            prev === token.pubkey ? null : token.pubkey
                                        )
                                    }
                                >
                                  <span className="text-lg">•••</span>
                                </Button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-32 rounded-md border bg-popover text-sm shadow-md z-50">
                                      <div
                                          className="px-3 py-2 text-destructive cursor-pointer hover:bg-muted rounded-md"
                                          onClick={() => tryCloseAccount(token)}
                                      >
                                        {t("wallet.close")}
                                      </div>
                                    </div>
                                )}
                              </>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })}
        </div>
      </ScrollArea>
  );
}
