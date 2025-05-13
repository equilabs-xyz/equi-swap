const WebSocket = require("ws");
const { URL } = require("url");

const wss = new WebSocket.Server({ port: 4352 });

console.log("WebSocket server running at ws://localhost:4352");

wss.on("connection", (socket, req) => {
    console.log("New client connected");

    const url = new URL(req.url, `ws://${req.headers.host}`);
    const signer = url.searchParams.get("signer");
    const x_mint = url.searchParams.get("x_mint");
    const y_mint = url.searchParams.get("y_mint");
    const amount = Number(url.searchParams.get("amount"));
    const slippage = Number(url.searchParams.get("slippage"));
    const priority_fee = Number(url.searchParams.get("priority_fee"));

    if (!signer || !x_mint || !y_mint || !amount) {
        console.error("Missing or invalid params");
        socket.close();
        return;
    }

    console.log(`Subscribed: ${signer}`);

    let tick = 0;
    const interval = setInterval(() => {
        const fluctuation = (Math.sin(tick / 5) + 1) * 0.5;
        const outAmount = 100 + fluctuation * 10;

        socket.send(JSON.stringify({
            type: "quote",
            signer,
            x_mint,
            y_mint,
            amount,
            slippage,
            priority_fee,
            expected_out: outAmount.toFixed(6),
            timestamp: Date.now()
        }));

        tick++;
    }, 3000);

    socket.on("close", () => {
        clearInterval(interval);
        console.log("Client disconnected");
    });
});
