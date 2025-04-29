// TokenSelectDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function TokenSelectDialog({
  open,
  setOpen,
  tokenAccounts,
  onSelect,
}: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const filteredTokens = tokenAccounts.filter((token: any) => {
    const symbol = token.metadata?.symbol?.toLowerCase() || "";
    const name = token.metadata?.name?.toLowerCase() || "";
    return (
      symbol.includes(searchQuery.toLowerCase()) ||
      name.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[480px] rounded-2xl p-0 overflow-hidden shadow-xl h-[75vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">
            t("token.select")
          </DialogTitle>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search token name or symbol..."
              className="pl-11 h-14 rounded-xl text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(75vh-180px)] px-4">
          <div className="space-y-2 pb-4">
            {filteredTokens.map((token: any) => (
              <div
                key={token.mint}
                className="rounded-xl hover:bg-accent/30 transition-colors"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 px-4 py-5 h-auto"
                  onClick={() => {
                    onSelect(token);
                    setOpen(false);
                  }}
                >
                  <Avatar className="h-10 w-10 ring-2 ring-muted/30">
                    <AvatarImage
                      src={token.metadata?.logoURI || ""}
                      alt={token.metadata?.symbol || "?"}
                      className="object-contain"
                    />
                    <AvatarFallback className="font-medium text-lg">
                      {token.metadata?.symbol?.slice(0, 2).toUpperCase() ||
                        "TO"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-base">
                        {token.metadata?.symbol || t("token.unknown")}
                      </span>
                      {token.metadata?.name && (
                        <span className="text-sm text-muted-foreground">
                          {token.metadata.name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      t("swap.balance"):{" "}
                      {token.balance.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {filteredTokens.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-lg">
            t("token.none")
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
