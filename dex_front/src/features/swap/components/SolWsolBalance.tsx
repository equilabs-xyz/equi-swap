import { Button } from "@/components/ui/button";
import { useTokenBalancesStore } from "@/stores/token-balances.ts";

export function SolWsolBalance({
                                   onManage,
                               }: {
    onManage: () => void;
}) {
    const balances = useTokenBalancesStore((s) => s.balances);
    const solBalance = balances["11111111111111111111111111111111"] ?? 0;
    const wsolBalance =
        balances["So11111111111111111111111111111111111111112"] ?? 0;

    return (
        <div className="flex items-center justify-between bg-card px-4 py-3 mb-2 rounded-xl border border-border text-sm">
            {/* Left: SOL + WSOL display */}
            <div className="flex gap-6">
                <div className="flex gap-1 items-baseline">
                    <span className="text-muted-foreground">SOL</span>
                    <span className="font-mono">{solBalance.toFixed(6)}</span>
                </div>

                <div className="flex gap-1 items-baseline">
                    <span className="text-muted-foreground">wSOL</span>
                    <span className="font-mono">{wsolBalance.toFixed(6)}</span>
                </div>
            </div>

            {/* Right: Manage button */}
            <Button variant="ghost" size="sm" onClick={onManage}>
                Manage
            </Button>
        </div>
    );
}
