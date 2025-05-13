const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

console.log("WebSocket server running at ws://localhost:3000");

wss.on("connection", (socket) => {
    console.log("New client connected");

    let interval = null;
    let lastRequest = null;
    let tick = 0;

    socket.on("message", (msg) => {
        try {
            const req = JSON.parse(msg.toString());
            lastRequest = req;
            console.log(`Subscribed: ${req.signer}`);
        } catch (e) {
            console.error("Invalid message", e);
        }
    });

    interval = setInterval(() => {
        if (!lastRequest) return;

        const { signer, x_mint, y_mint, amount, slippage, priority_fee } = lastRequest;

        const fluctuation = (Math.sin(tick / 5) + 1) * 0.5;
        const outAmount = 100 + fluctuation * 10;

        socket.send(
            JSON.stringify({
                type: "quote",
                signer,
                x_mint,
                y_mint,
                amount,
                slippage,
                priority_fee,
                expected_out: outAmount.toFixed(6),
                timestamp: Date.now(),
            })
        );

        tick++;
    }, 3000); // adjust to 3s or 15s if needed

    socket.on("close", () => {
        clearInterval(interval);
        console.log("Client disconnected");
    });
});
