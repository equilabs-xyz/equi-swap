import { create } from "zustand";

interface SettingsState {
    slippage: string;
    priorityFeeSOL: string;
    wrapWSOL: boolean;
    useJitoFee: boolean;

    setSlippage: (value: string) => void;
    setPriorityFeeSOL: (value: string) => void;
    setWrapWSOL: (value: boolean) => void;
    setUseJitoFee: (value: boolean) => void;

    persistSettings: () => void;
    loadSettings: () => void;
}

const SLIPPAGE_KEY = "swap:maxSlippage";
const PRIORITY_KEY = "swap:priorityFee";
const WRAP_SOL_KEY = "swap:wrapWSOL";
const JITO_KEY = "swap:useJitoFee";

export const useSettingsStore = create<SettingsState>((set, get) => ({
    slippage: "0.5",
    priorityFeeSOL: "0.00005",
    wrapWSOL: true,
    useJitoFee: true,

    setSlippage: (value) => set({ slippage: value }),
    setPriorityFeeSOL: (value) => set({ priorityFeeSOL: value }),
    setWrapWSOL: (value) => set({ wrapWSOL: value }),
    setUseJitoFee: (value) => set({ useJitoFee: value }),

    persistSettings: () => {
        const state = get();
        localStorage.setItem(SLIPPAGE_KEY, state.slippage);
        const lamports = Math.round(parseFloat(state.priorityFeeSOL || "0") * 1_000_000);
        localStorage.setItem(PRIORITY_KEY, lamports.toString());
        localStorage.setItem(WRAP_SOL_KEY, state.wrapWSOL.toString());
        localStorage.setItem(JITO_KEY, state.useJitoFee.toString());
    },

    loadSettings: () => {
        const savedSlippage = localStorage.getItem(SLIPPAGE_KEY);
        const savedPriority = localStorage.getItem(PRIORITY_KEY);
        const savedWrap = localStorage.getItem(WRAP_SOL_KEY);
        const savedJito = localStorage.getItem(JITO_KEY);

        if (savedSlippage) set({ slippage: savedSlippage });
        if (savedPriority) set({ priorityFeeSOL: (parseInt(savedPriority, 10) / 1_000_000).toString() });
        if (savedWrap !== null) set({ wrapWSOL: savedWrap === "true" });
        if (savedJito !== null) set({ useJitoFee: savedJito === "true" });
    },
}));

export async function getEffectivePriorityFee(): Promise<number> {
    const { useJitoFee, priorityFeeSOL } = useSettingsStore.getState();
    if (!useJitoFee) {
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

export function getUseJitoFee(): boolean {
    return useSettingsStore.getState().useJitoFee;
}
export function getPriorityFee(): number {
    return parseFloat(useSettingsStore.getState().priorityFeeSOL || "0.0001");
}
