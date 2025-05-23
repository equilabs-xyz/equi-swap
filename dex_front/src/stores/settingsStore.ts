import { create } from "zustand";

interface SettingsState {
    slippage: string;
    priorityFeeSOL: string;
    wrapWSOL: boolean;
    useJito: boolean;
    jitoThreshold: number;

    setSlippage: (value: string) => void;
    setPriorityFeeSOL: (value: string) => void;
    setWrapWSOL: (value: boolean) => void;
    setUseJito: (value: boolean) => void;
    setJitoThreshold: (val: number) => void;

    persistSettings: () => void;
    loadSettings: () => void;
}

const SLIPPAGE_KEY = "swap:maxSlippage";
const PRIORITY_KEY = "swap:priorityFee";
const WRAP_SOL_KEY = "swap:wrapWSOL";
const JITO_KEY = "swap:useJitoFee";
const JITO_THRESHOLD_KEY = "swap:jitoThreshold";

export const useSettingsStore = create<SettingsState>((set, get) => ({
    slippage: "0.5",
    priorityFeeSOL: "0.00005",
    wrapWSOL: true,
    useJito: true,
    jitoThreshold: 0.00001, // ✅ Default value

    setSlippage: (value) => set({ slippage: value }),
    setPriorityFeeSOL: (value) => set({ priorityFeeSOL: value }),
    setWrapWSOL: (value) => set({ wrapWSOL: value }),
    setUseJito: (value) => set({ useJito: value }),
    setJitoThreshold: (value) => set({ jitoThreshold: value }),

    persistSettings: () => {
        const state = get();

        localStorage.setItem(SLIPPAGE_KEY, state.slippage);
        const lamports = Math.round(parseFloat(state.priorityFeeSOL || "0") * 1_000_000);
        localStorage.setItem(PRIORITY_KEY, lamports.toString());
        localStorage.setItem(WRAP_SOL_KEY, state.wrapWSOL.toString());
        localStorage.setItem(JITO_KEY, state.useJito.toString());
        localStorage.setItem(JITO_THRESHOLD_KEY, state.jitoThreshold.toString()); // ✅ Save threshold
    },

    loadSettings: () => {
        const savedSlippage = localStorage.getItem(SLIPPAGE_KEY);
        const savedPriority = localStorage.getItem(PRIORITY_KEY);
        const savedWrap = localStorage.getItem(WRAP_SOL_KEY);
        const savedJito = localStorage.getItem(JITO_KEY);
        const savedThreshold = localStorage.getItem(JITO_THRESHOLD_KEY);

        if (savedSlippage) set({ slippage: savedSlippage });
        if (savedPriority) {
            set({ priorityFeeSOL: (parseInt(savedPriority, 10) / 1_000_000).toString() });
        }
        if (savedWrap !== null) set({ wrapWSOL: savedWrap === "true" });
        if (savedJito !== null) set({ useJito: savedJito === "true" });
        if (savedThreshold) set({ jitoThreshold: parseFloat(savedThreshold) }); // ✅ Load threshold
    },
}));

export async function getEffectivePriorityFee(): Promise<number> {
    const { useJito, priorityFeeSOL } = useSettingsStore.getState();
    if (!useJito) {
        return parseFloat(priorityFeeSOL || "0.00003");
    }

    try {
        const res = await fetch("/api/fetchJitoTipFloor");
        const json = await res.json();

        if (!json.success || !Array.isArray(json.result?.data)) {
            throw new Error("Invalid JITO response");
        }

        return json.result.data[0]?.landed_tips_75th_percentile ?? 0.0001;
    } catch (e) {
        console.error("Failed to fetch JITO tip floor:", e);
        return 0.0001;
    }
}

export function getMaxSlippage(): number {
    return parseFloat(useSettingsStore.getState().slippage || "0.5");
}

export function getWrapWSOL(): boolean {
    return useSettingsStore.getState().wrapWSOL;
}

export function getUseJito(): boolean {
    return useSettingsStore.getState().useJito;
}

export function getPriorityFee(): number {
    return parseFloat(useSettingsStore.getState().priorityFeeSOL || "0.0001");
}

export function getJitoThreshold(): number {
    return useSettingsStore.getState().jitoThreshold;
}
