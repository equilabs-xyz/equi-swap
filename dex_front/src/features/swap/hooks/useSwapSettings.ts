// features/swap/hooks/useSwapSettings.ts
import { useEffect, useState } from "react";

const STORAGE_KEY = "swap-settings";

export interface SwapSettings {
    priorityFee: number; // microLamports
    slippage: number;    // percentage
}

const DEFAULT_SETTINGS: SwapSettings = {
    priorityFee: 0,
    slippage: 0.5,
};

export function useSwapSettings() {
    const [settings, setSettings] = useState<SwapSettings>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    return {
        settings,
        setSettings,
        update: (partial: Partial<SwapSettings>) =>
            setSettings((prev) => ({ ...prev, ...partial })),
    };
}
