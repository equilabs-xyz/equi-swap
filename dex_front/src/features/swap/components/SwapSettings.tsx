import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SLIPPAGE_KEY = "swap:maxSlippage";
const PRIORITY_KEY = "swap:priorityFee"; // stored in lamports

export function SwapSettingsDialog() {
    const [open, setOpen] = useState(false);
    const [slippage, setSlippage] = useState("0.5");
    const [priorityFeeSOL, setPriorityFeeSOL] = useState("0.000001"); // show as SOL

    // Load saved settings
    useEffect(() => {
        const savedSlippage = localStorage.getItem(SLIPPAGE_KEY);
        const savedPriority = localStorage.getItem(PRIORITY_KEY);
        if (savedSlippage) setSlippage(savedSlippage);
        if (savedPriority) {
            const solVal = (parseInt(savedPriority, 10) / 1_000_000).toString();
            setPriorityFeeSOL(solVal);
        }
    }, []);

    const saveSettings = () => {
        const lamports = Math.round(parseFloat(priorityFeeSOL || "0") * 1_000_000); // convert SOL -> μLamports
        localStorage.setItem(SLIPPAGE_KEY, slippage);
        localStorage.setItem(PRIORITY_KEY, lamports.toString());
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1 rounded-md text-muted-foreground border border-input text-sm bg-background hover:bg-muted transition">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="text-xs">
            {priorityFeeSOL} SOL • {slippage}%
          </span>
                </button>
            </DialogTrigger>

            <DialogContent className="w-full max-w-xs p-4 rounded-xl bg-popover text-foreground border border-border space-y-4">
                <h3 className="text-base font-semibold">Swap Settings</h3>

                <div className="space-y-3 text-sm">
                    <div>
                        <label className="text-muted-foreground mb-1 block">Priority Fee (SOL)</label>
                        <Input
                            type="number"
                            step="0.000001"
                            min="0"
                            value={priorityFeeSOL}
                            onChange={(e) => setPriorityFeeSOL(e.target.value)}
                            className="bg-input border-border text-foreground text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-muted-foreground mb-1 block">Max Slippage (%)</label>
                        <div className="flex gap-2 flex-wrap">
                            {["0.1", "0.5", "1"].map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setSlippage(preset)}
                                    className={`px-3 py-1 rounded-md text-xs border transition ${
                                        slippage === preset
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground"
                                    }`}
                                >
                                    {preset}%
                                </button>
                            ))}
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                value={slippage}
                                onChange={(e) => setSlippage(e.target.value)}
                                className="w-20 bg-input border-border text-foreground text-sm"
                            />
                        </div>
                    </div>
                </div>

                <Button onClick={saveSettings} size="sm" className="w-full mt-1">
                    Save
                </Button>
            </DialogContent>
        </Dialog>
    );
}


export function getMaxSlippage(): number {
    const stored = localStorage.getItem("swap:maxSlippage");
    return stored ? parseFloat(stored) : 0.5;
}

export function getPriorityFee(): number {
    const stored = localStorage.getItem("swap:priorityFee");
    return stored ? parseInt(stored, 10) / 1_000_000 : 0.0001;
}
