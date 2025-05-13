import { useEffect, useRef } from "react";

interface QuoteParams {
    signer: string;
    x_mint: string;     // maps to `x_mint`
    y_mint: string;    // maps to `y_mint`
    amount: number;   // maps to `amount`
    slippage: number;   // maps to `slippage` (u8)
    priority_fee: number;// maps to `priority_fee` (u16)
    onQuote: (expected_out: number) => void;
}
const WS_QUOTE_CONNECTION = import.meta.env.VITE_WS_QUOTE_CONNECTION;

export function useQuoteWebSocket(params: QuoteParams | null): void {
    const wsRef = useRef<WebSocket | null>(null);
    const lastHashRef = useRef<string>("");


    useEffect(() => {
        if (!params) return;

        const { signer, x_mint, y_mint, amount, slippage, priority_fee, onQuote } = params;

        if (!signer || !x_mint || !y_mint || amount <= 0) return;

        const paramHash = JSON.stringify({ signer, x_mint, y_mint, amount, slippage, priority_fee });

        if (paramHash === lastHashRef.current) return;
        lastHashRef.current = paramHash;

        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket(WS_QUOTE_CONNECTION);
        wsRef.current = ws;

        ws.onopen = () => {
            const payload = {
                signer,
                x_mint,
                y_mint,
                amount,
                slippage,
                priority_fee,
            };
            ws.send(JSON.stringify(payload));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.expected_out) {
                    onQuote(parseFloat(data.expected_out));
                }
            } catch (err) {
                console.error("Invalid quote message", err);
            }
        };

        return () => {
            ws.close();
        };
    }, [params]); // <=== Only depends on the object itself

}
