import { useEffect, useRef } from "react";

interface QuoteParams {
    signer: string;
    x_mint: string;
    y_mint: string;
    amount: number;
    slippage: number;
    priority_fee: number;
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

        // Hash to detect real param changes
        const paramHash = `${signer}-${x_mint}-${y_mint}-${amount}-${slippage}-${priority_fee}`;
        if (paramHash === lastHashRef.current) return;
        lastHashRef.current = paramHash;

        // Cleanup old socket
        if (wsRef.current) {
            wsRef.current.close();
        }

        const query = new URLSearchParams({
            signer,
            x_mint,
            y_mint,
            amount: amount.toString(),
            slippage: slippage.toString(),
            priority_fee: priority_fee.toString(),
        }).toString();

        const ws = new WebSocket(`${WS_QUOTE_CONNECTION}?${query}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected:", ws.url);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Quote message received:", data);
                if (data.expected_out) {
                    onQuote(parseFloat(data.expected_out));
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

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [
        params?.signer,
        params?.x_mint,
        params?.y_mint,
        params?.amount,
        params?.slippage,
        params?.priority_fee,
        params?.onQuote,
    ]);
}
