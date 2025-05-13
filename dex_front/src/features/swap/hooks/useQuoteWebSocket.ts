import { useEffect, useRef } from "react";

interface QuoteParams {
    signer: string;
    mintIn: string;     // maps to `x_mint`
    mintOut: string;    // maps to `y_mint`
    inAmount: number;   // maps to `amount`
    slippage: number;   // maps to `slippage` (u8)
    priorityFee: number;// maps to `priority_fee` (u16)
    onQuote: (outAmount: number) => void;
}

export function useQuoteWebSocket(params: QuoteParams | null): void {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!params) return;

        const { signer, mintIn, mintOut, inAmount, slippage, priorityFee, onQuote } = params;

        if (!signer || !mintIn || !mintOut || inAmount <= 0) return;

        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket("ws://localhost:3000");
        wsRef.current = ws;

        ws.onopen = () => {
            const payload = {
                signer,
                x_mint: mintIn,
                y_mint: mintOut,
                amount: inAmount.toString(), // convert to string to preserve u128 compatibility
                slippage,
                priority_fee: priorityFee,
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
    }, [
        params?.signer,
        params?.mintIn,
        params?.mintOut,
        params?.inAmount,
        params?.slippage,
        params?.priorityFee,
        params?.onQuote,
    ]);
}
