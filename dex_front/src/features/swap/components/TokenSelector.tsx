// TokenSelector.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenInfo } from "@/data/token-list";
import { useTranslation } from "react-i18next";

interface Props {
  label: string;
  selected: TokenInfo | null;
  onSelect: (token: TokenInfo) => void;
  publicKey: string;
}

export function formatBalance(balance?: number, decimals = 9) {
  if (typeof balance !== "number") return "—";
  const maxFD = Math.min(decimals, 20);
  const minFD = Math.min(2, maxFD);
  return balance.toLocaleString(undefined, {
    minimumFractionDigits: minFD,
    maximumFractionDigits: maxFD,
  });
}

export default function TokenSelector({
  label,
  selected,
  onSelect,
  publicKey,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [walletTokens, setWalletTokens] = useState<TokenInfo[]>([]);
  const [allTokens, setAllTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Normalize raw token object into TokenInfo
  const normalize = (t: any, fromWallet: boolean): TokenInfo => ({
    name: t.name,
    symbol: t.symbol,
    address: t.mint || t.address,
    logoURI: t.imageUri,
    decimals: t.decimals,
    balance: fromWallet
      ? (t.totalUiAmount ?? 0)
      : (t.balance ?? t.totalUiAmount ?? 0),
    verified: t.verified ?? false,
  });

  // Fetch wallet + off-query on dialog open
  const fetchOnOpen = async () => {
    setLoading(true);
    try {
      // Wallet tokens
      const walletRes = await fetch(
        `/api/wallet?address=${encodeURIComponent(publicKey)}`,
      ).then((r) => r.json());
      const wRaw: any[] = walletRes.result?.tokens ?? [];
      const w = wRaw.filter((t) => t.swappable).map((t) => normalize(t, true));

      // All tokens off-query
      const allRes = await fetch(`/api/searchToken?query=`).then((r) =>
        r.json(),
      );
      const aRaw: any[] = allRes.tokens ?? [];
      const a = aRaw.filter((t) => t.swappable).map((t) => normalize(t, false));

      setWalletTokens(w);
      setAllTokens(a);
    } catch (err) {
      console.error(err);
      setWalletTokens([]);
      setAllTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch search results when typing
  const fetchOnSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/searchToken?query=${encodeURIComponent(search)}`,
      ).then((r) => r.json());
      const raw: any[] = res.tokens ?? [];
      const filtered = raw
        .filter((t) => t.swappable)
        .map((t) => normalize(t, false));
      setAllTokens(filtered);
    } catch (err) {
      console.error(err);
      setAllTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect: on dialog open or publicKey change
  useEffect(() => {
    if (open) {
      setSearch("");
      fetchOnOpen();
    }
  }, [open, publicKey]);

  // Effect: on search change (debounced)
  useEffect(() => {
    if (!open) return;
    if (search === "") {
      // Reset to full off-query list
      fetchOnOpen();
      return;
    }
    const id = setTimeout(fetchOnSearch, 200);
    return () => clearTimeout(id);
  }, [search]);

  // Filter lists by search term
  const matches = (t: TokenInfo) =>
    `${t.symbol} ${t.name}`.toLowerCase().includes(search.toLowerCase());

  const displayWallet = walletTokens.filter(matches);
  const displayAll = allTokens.filter(matches);

  const renderToken = (token: TokenInfo) => (
    <button
      key={token.address}
      onClick={() => {
        onSelect(token);
        setOpen(false);
      }}
      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <img
          src={token.logoURI}
          alt={token.symbol}
          className="w-5 h-5 rounded-full"
        />
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium flex items-center gap-1">
            {token.name} ({token.symbol})
            {token.verified && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </span>
          <span className="text-xs text-muted-foreground">{token.address}</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">
        {formatBalance(token.balance, token.decimals)}
      </span>
    </button>
  );

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-sm text-muted-foreground">{label}</label>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-popover hover:bg-accent border border-input w-full">
            {selected ? (
              <div className="flex items-center gap-2">
                <img
                  src={selected.logoURI}
                  alt={selected.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{selected.symbol}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t("token.select")}
              </span>
            )}
            <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-md bg-popover border border-border text-foreground p-4">
          <Input
            placeholder={t("token.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />

          <ScrollArea className="max-h-96 space-y-2">
            {loading ? (
              // Skeleton loading placeholders
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-10" />
                </div>
              ))
            ) : (
              <>
                {/* WALLET BALANCES */}
                <div className="text-xs text-muted-foreground px-2 uppercase">
                  {t("wallet.balance")}
                </div>
                {displayWallet.length > 0 ? (
                  displayWallet.map(renderToken)
                ) : (
                  <div className="text-center text-muted-foreground py-2">
                    {t("token.none")}
                  </div>
                )}

                {/* ALL TOKENS */}
                <div className="text-xs text-muted-foreground px-2 pt-4 uppercase">
                  {t("token.all")}
                </div>
                {displayAll.length > 0 ? (
                  displayAll.map(renderToken)
                ) : (
                  <div className="text-center text-muted-foreground py-2">
                    {t("token.none")}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
