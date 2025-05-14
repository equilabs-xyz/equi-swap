const WebSocket = require("ws");
const { URL } = require("url");
const bs58 = require("bs58"); // optional if you want bs58 encoding
const { Buffer } = require("buffer");

const PORT = 4352;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server running at ws://localhost:${PORT}`);

wss.on("connection", (socket, req) => {
    const url = new URL(req.url, `ws://${req.headers.host}`);

    const signer = url.searchParams.get("signer");
    const x_mint = url.searchParams.get("x_mint");
    const y_mint = url.searchParams.get("y_mint");
    const amount = Number(url.searchParams.get("amount"));
    const slippage = Number(url.searchParams.get("slippage"));
    const priority_fee = Number(url.searchParams.get("priority_fee"));

    if (!signer || !x_mint || !y_mint || isNaN(amount)) {
        console.error("Missing or invalid params:", {
            signer,
            x_mint,
            y_mint,
            amount,
        });
        socket.close();
        return;
    }

    console.log(`Client subscribed: ${signer}`);
    let tick = 0;

    const interval = setInterval(() => {
        const fluctuation = (Math.sin(tick / 5) + 1) * 0.5;
        const expected_out = 100 + fluctuation * 10;

        // Mock transaction as base64 (placeholder byte buffer)
        const fakeTx = Buffer.from(`fake-transaction-${tick}`).toString("base64");

        const quote = {
            type: "quote",
            signer,
            x_mint,
            y_mint,
            amount,
            slippage,
            priority_fee,
            expected_out: expected_out.toFixed(6),
            transaction: fakeTx, // << added here
            timestamp: Date.now(),
        };

        socket.send(JSON.stringify(quote));
        tick++;
    }, 3000);

    socket.on("close", () => {
        clearInterval(interval);
        console.log(`Client disconnected: ${signer}`);
    });
});
