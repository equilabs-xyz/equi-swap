import { useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import {
    fetchSignatures,
    fetchTransactionsBySignatures,
} from "@/features/wallet/services/solana.ts";
import { useTransactionsStore } from "@/stores/transactionsStore";
import { format, isToday, isYesterday } from "date-fns";
import { WalletTransactionsTabProps } from "@/types";

// ✅ Add type for transactions
type WalletTransaction = {
    timestamp: number;
    amount?: string;
    symbol?: string;
    type?: string;
    status?: string;
    signature?: string;
    picture?: string;
};

export default function WalletTransactionsTab({ address }: WalletTransactionsTabProps) {
    const {
        setWallet,
        getTransactions,
        addTransactions,
        allSignatures,
        loadedTransactions,
        loadCount,
        loading,
        setLoadCount,
        setLoadedTransactions,
        setAllSignatures,
        setLoading,
        setError,
    } = useTransactionsStore();

    const { t } = useTranslation();
    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!address) return;

        setWallet(address);
        const cached = getTransactions(address, 5 * 60 * 1000); // 5 min TTL

        if (cached) {
            setLoadedTransactions(cached.transactions);
            setAllSignatures(cached.signatures);
        } else {
            (async () => {
                try {
                    setLoading(true);
                    const sigs = await fetchSignatures(address);
                    const txs = await fetchTransactionsBySignatures(address, sigs.slice(0, 10));
                    addTransactions(address, sigs, txs);
                    setAllSignatures(sigs);
                    setLoadedTransactions(txs);
                } catch (e) {
                    console.error("[Initial Fetch] Error:", e);
                    setError("Failed to load transactions");
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [address]);

    useEffect(() => {
        if (!address || loading || loadedTransactions.length >= allSignatures.length) return;

        const loadMoreTransactions = async () => {
            const start = loadedTransactions.length;
            const end = Math.min(start + 10, allSignatures.length);
            const chunk = allSignatures.slice(start, end);
            if (chunk.length === 0) return;

            setLoading(true);
            setError(null);
            try {
                const newTxs = await fetchTransactionsBySignatures(address, chunk);
                setLoadedTransactions([...loadedTransactions, ...newTxs]);
            } catch (e) {
                console.error("[loadMoreTransactions] Error:", e);
                setError("Failed to fetch more transactions");
            } finally {
                setLoading(false);
            }
        };

        loadMoreTransactions();
    }, [loadCount]);

    const onIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0];
            if (entry.isIntersecting && !loading && loadedTransactions.length < allSignatures.length) {
                setLoadCount(Math.min(loadCount + 10, allSignatures.length));
            }
        },
        [loadedTransactions.length, allSignatures.length, loading, setLoadCount]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(onIntersection, { threshold: 1.0 });
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [onIntersection]);

    const getDateLabel = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        if (isToday(date)) return t("date.today") || "Today";
        if (isYesterday(date)) return t("date.yesterday") || "Yesterday";
        return format(date, "d MMMM");
    };

    const safeTransactions: WalletTransaction[] = Array.isArray(loadedTransactions)
        ? loadedTransactions
        : [];

    const grouped = safeTransactions.reduce(
        (acc: Record<string, WalletTransaction[]>, tx: WalletTransaction) => {
            const label = getDateLabel(tx.timestamp);
            if (!acc[label]) acc[label] = [];
            acc[label].push(tx);
            return acc;
        },
        {}
    );

    const sortedGroups = Object.entries(grouped).sort(
        ([, aTxs], [, bTxs]) =>
            (bTxs as WalletTransaction[])[0].timestamp - (aTxs as WalletTransaction[])[0].timestamp
    );

    return (
        <ScrollArea className="min-h-[20vh] h-[100vh] max-h-[65vh] pt-4">
            <div className="space-y-2 pb-[100px]">
                <div className="space-y-2">
                    {loading && loadedTransactions.length === 0 ? (
                        Array(3)
                            .fill(0)
                            .map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                    ) : loadedTransactions.length > 0 ? (
                        sortedGroups.map(([label, txs]) => (
                            <div key={label}>
                                <p className="text-xs text-muted-foreground uppercase mb-1">{label}</p>
                                {(txs as WalletTransaction[]).map((tx: WalletTransaction, index: number) => {
                                    const amount = parseFloat(tx.amount ?? "0");
                                    const symbol = tx.symbol ?? "wallet.unknown";
                                    const status =
                                        tx.status?.toLowerCase() === "confirmed"
                                            ? t("tx.success")
                                            : t("tx.failed");

                                    return (
                                        <a
                                            key={`${tx.signature || index}`}
                                            href={`https://solscan.io/tx/${tx.signature}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-lg border p-3 hover:bg-accent transition-colors mb-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Avatar>
                                                        {tx.type === "UNKNOWN" ? (
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-lg font-bold">
                                                                ?
                                                            </div>
                                                        ) : (
                                                            <AvatarImage src={tx.picture || ""} alt={tx.symbol || "?"} />
                                                        )}
                                                    </Avatar>
                                                    <div className="ml-2">
                                                        <p className="text-sm">
                                                            {tx.type === "SENT"
                                                                ? t("wallet.sent")
                                                                : tx.type === "RECEIVED"
                                                                    ? t("wallet.received")
                                                                    : tx.type === "CLOSED ACCOUNT"
                                                                        ? t("wallet.closedAccount")
                                                                        : tx.type === "APP INTERACTION"
                                                                            ? t("wallet.appInteraction")
                                                                            : t("wallet.unknown")}{" "}
                                                            {tx.symbol}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(tx.timestamp * 1000).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p
                                                        className={`font-medium ${
                                                            amount > 0 ? "text-green-500" : "text-red-500"
                                                        }`}
                                                    >
                                                        {amount > 0 ? "+" : "-"}
                                                        {Math.abs(amount).toLocaleString(undefined, {
                                                            maximumFractionDigits: 4,
                                                        })}{" "}
                                                        {symbol}
                                                    </p>
                                                    <p
                                                        className={`text-sm ${
                                                            status === t("tx.success")
                                                                ? "text-muted-foreground"
                                                                : "text-destructive"
                                                        }`}
                                                    >
                                                        {status}
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">{t("loading.title")}</p>
                    )}
                    {loading && loadedTransactions.length > 0 && (
                        <div className="text-center py-2 text-muted-foreground text-sm">
                            {t("loading.more") || "Loading more..."}
                        </div>
                    )}
                </div>
                <div ref={observerRef} className="h-8" />
            </div>
        </ScrollArea>
    );
}
