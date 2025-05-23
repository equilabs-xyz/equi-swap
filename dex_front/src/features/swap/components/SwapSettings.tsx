import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/settingsStore";

export function SwapSettingsDialog() {
    const [open, setOpen] = useState(false);

    const {
        slippage,
        priorityFeeSOL,
        wrapWSOL,
        useJito,
        setSlippage,
        setPriorityFeeSOL,
        setWrapWSOL,
        setUseJito,
        loadSettings,
        persistSettings,
    } = useSettingsStore();

    useEffect(() => {
        loadSettings();
    }, []);

    const saveSettings = () => {
        persistSettings();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1 rounded-md text-muted-foreground border border-input text-sm bg-background hover:bg-muted transition">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="text-xs">
            {useJito
                ? `JITO AUTO FEE • ${slippage}%`
                : `${priorityFeeSOL} SOL • ${slippage}%`}
          </span>
                </button>
            </DialogTrigger>

            <DialogContent className="w-full max-w-xs p-4 rounded-xl bg-popover text-foreground border border-border space-y-4">
                <h3 className="text-base font-semibold">Swap Settings</h3>

                <div className="space-y-3 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-muted-foreground text-sm">Use JITO</label>
                            <Switch
                                checked={useJito}
                                onCheckedChange={(val) => setUseJito(val)}
                            />
                        </div>

                        {!useJito && (
                            <div>
                                <label className="text-muted-foreground mb-1 block">
                                    Priority Fee (SOL)
                                </label>
                                <Input
                                    type="number"
                                    step="0.000001"
                                    min="0"
                                    value={priorityFeeSOL}
                                    onChange={(e) => setPriorityFeeSOL(e.target.value)}
                                    className="bg-input border-border text-foreground text-sm"
                                />
                            </div>
                        )}

                    </div>

                    <div>
                        <label className="text-muted-foreground mb-1 block">
                            Max Slippage (%)
                        </label>
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

                    <div className="flex items-center justify-between">
                        <label className="text-muted-foreground text-sm">
                            Wrap SOL Automatically
                        </label>
                        <Switch
                            checked={wrapWSOL}
                            onCheckedChange={(val) => setWrapWSOL(val)}
                        />
                    </div>
                </div>

                <Button onClick={saveSettings} size="sm" className="w-full mt-1">
                    Save
                </Button>
            </DialogContent>
        </Dialog>
    );
}
