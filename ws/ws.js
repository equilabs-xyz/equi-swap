const WebSocket = require('ws');
const { URL } = require('url');

const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server running at ws://localhost:8080");

wss.on('connection', (socket, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const signer = url.searchParams.get("signer");
    const mintIn = url.searchParams.get("mintIn");
    const mintOut = url.searchParams.get("mintOut");
    const inAmount = parseFloat(url.searchParams.get("inAmount"));
    const slippage = parseFloat(url.searchParams.get("slippage"));
    const priorityFee = parseFloat(url.searchParams.get("priorityFee"));

    console.log(`New subscription from ${signer}`);

    let baseRate = 100;
    let tick = 0;

    const interval = setInterval(() => {
        const fluctuation = (Math.sin(tick / 5) + 1) * 0.5;
        const outAmount = baseRate + fluctuation * 10;

        socket.send(JSON.stringify({
            type: 'quote',
            signer,
            mintIn,
            mintOut,
            inAmount,
            slippage,
            priorityFee,
            outAmount: outAmount.toFixed(6),
            timestamp: Date.now()
        }));

        tick++;
    }, 3000);

    socket.on('close', () => {
        clearInterval(interval);
        console.log("Client disconnected");
    });
});
