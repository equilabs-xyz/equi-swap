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
            transaction: "AIABAAUdAjP21GBxY+Hbo1Ol1ff4bVmlYdqEe7OFXCKVrNAgTEwBEfpNuDDK9cU2vQx3j3RRcEcHZmb2XpIZ+ufpnynlvQZSZfEzX1Vw7ZfQlim+QiTxdaVuw8+1NDGIMBJsZEi9C3mxwceAF6b6ljfffPYRblVrmIZk/IfnpLF1rkRSHecNX3pkoe43EzxZ+GddhOcBJbggufAAZ4Y4t+7NTDjoxQ3qL+yv5LE/fDWHWOIUywzc7+P2v+IfJaMZaLiVsXe0D7MiqxKTuJsnTIvxvF32WSUnygpNb7GWisNQs6eZcQ8WWH+6WOfummwXVvtn0DE6F1HtMJvoKIoCzlcuZE51pR2WGCI1eX5ZzNVjUXB6LzYG4JRTG/RaR7MoLEP1WKctKgwt118N9Zz0CXakV2KxyhOMshJcVTAO7b6V1TrDtCAxfGxW3LCJFCCG4YS/EsLY19imFpa9BTil473qGiQX3TiTgEjOx82dgr0VUhYfF+2Wr2UgPNUYtMbG7GIYlArbQTINwsYMuKOfPkn1kApf5ouqpACk1CotVFQPtm4kiIVSEXH3tlmBiRqXUVNoPz7U9cCdV05LT0IbT+l58dzITlU1OY5q00HnrBZu0cfD4iBNZwLKD01e5FBW3MC20AI6WTk7RKExUp/w0t4Nk6r0XjKXu0EEdjzBjs885WWU63FZO3rqPK0ZiYCM3xcALFarSOm157osG+Si6NhoO4x9ZGMIsFy8A/93mUmY/V17IxOWX+AFvoa/6TtmETurEmcZrVp6Oe/SD3h/6m7HHXtJ0h17PTNVvvR6tyF49eu/k8rGDlIfgnwDqMTRL8YcC33q/1rPxBu7gPdpXO3n8kUuqNIw64ZbLFDJsS9jm9tBn+kejISaMBBSJ7eymzJa1Vlz4fWtIFPvlGZ0BmNZF2xSe5iCEsMnovtaFeH+FU8bw/vl7CgRotYplVlEUMpbJ4iBH2GkEP4x7XaF2THVZVFOBfnKKbtImio48jX81Wz6B1oNqHXejkDLVRVlTEPR9bGGAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAVZbeLrsW9b/BmMzGOog5/Y5jS8ygOj3+MOATiiOeKeNjJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+FnHKtU3liwnC07xG8cqVj9ibRCOgHB88fi3oKZboNIusHqyOIv+I2KXZcVAqhxGj5FLuJRj/t5pAr6DtRZTf9jRBBgACQOghgEAAAAAABsGAAgAGR4hAQAbBgASABoeIQEAHCQAGRoIEiEgJiQjHyIlHh0EFAMNCQUGExUBCxYOCgwPFxARBwIdACMADwMAAAAAoIYBAMBmCgAAAAAAAAAAAAAAAAAB5jUWC4ky/IeHitxMPxwIPOm/OWi6xg9I7VjD+PnhkasBCQkIBQEABgQDBwI=", // << added here
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
