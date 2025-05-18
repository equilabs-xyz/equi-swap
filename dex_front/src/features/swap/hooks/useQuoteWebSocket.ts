import { useEffect, useRef } from "react";
import { useSwapStore } from "@/stores/swap-ui";
import { getEffectivePriorityFee, getMaxSlippage } from "@/stores/settingsStore.ts";

interface QuoteParams {
    signer: string;
    x_mint: string;
    y_mint: string;
    amount: number;
    onQuote: (expected_out: number, transaction?: string, arb_transaction?: string) => void;
    slippage: string;
    priorityFeeSOL: string;
    useJitoFee: boolean;
}

const WS_QUOTE_CONNECTION = import.meta.env.VITE_WS_QUOTE_CONNECTION;

export function useQuoteWebSocket(params: QuoteParams | null): void {
    const wsRef = useRef<WebSocket | null>(null);
    const lastHashRef = useRef<string>("");
    const setTransaction = useSwapStore((s) => s.setTransaction);
    const setArbTransaction = useSwapStore((s) => s.setArbTransaction);

    useEffect(() => {
        if (!params) return;

        const { signer, x_mint, y_mint, amount, onQuote } = params;
        if (!signer || !x_mint || !y_mint || amount <= 0) return;

        const subscribe = async () => {
            const slippage = getMaxSlippage();
            const priorityFee = await getEffectivePriorityFee(); // fetch JITO or manual

            const paramHash = `${signer}-${x_mint}-${y_mint}-${amount}-${slippage}-${priorityFee}`;
            if (paramHash === lastHashRef.current) return;
            lastHashRef.current = paramHash;

            if (wsRef.current) {
                wsRef.current.close();
            }

            const ws_slippage = Math.round(slippage * 100);
            const ws_priority_fee = Math.round(priorityFee * 1_000_000_000);
            const query = new URLSearchParams({
                signer,
                x_mint,
                y_mint,
                amount: amount.toString(),
                slippage: ws_slippage.toString(),
                priority_fee: ws_priority_fee.toString(),
            }).toString();

            const ws = new WebSocket(`${WS_QUOTE_CONNECTION}?${query}`);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const out = parseFloat(data.expected_out);
                    const tx = data.message as string | undefined;
                    const arb_tx = data.arb_transaction as string | undefined;

                    if (!isNaN(out)) {
                        if (tx) setTransaction(tx);
                        if (arb_tx) setArbTransaction(arb_tx);
                        onQuote(out, tx, arb_tx);
                    }
                } catch (err) {
                    console.error("Invalid quote message", err);
                }
            };

            ws.onerror = (e) => {
                console.error("WebSocket error", e);
            };

            ws.onclose = () => {
                console.log("WebSocket closed:", ws.url);
            };
        };

        subscribe();

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [
        params?.signer,
        params?.x_mint,
        params?.y_mint,
        params?.amount,
        params?.onQuote,
        params?.slippage,
        params?.priorityFeeSOL,
        params?.useJitoFee,
    ]);
}
