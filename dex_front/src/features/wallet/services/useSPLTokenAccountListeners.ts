import { useEffect, useRef } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export const useSPLTokenAccountListeners = ({
                                                tokenAccounts,
                                                onAccountChange,
                                            }: {
    tokenAccounts: { pubkey: string }[];
    onAccountChange: (changedPubkey: string) => void;
}) => {

    console.log("RPC:", import.meta.env.VITE_SOLANA_RPC);
    console.log("WS:", import.meta.env.VITE_WS_SOLANA_RPC);

    const connectionRef = useRef(
        new Connection(import.meta.env.VITE_SOLANA_RPC, {
            wsEndpoint: import.meta.env.VITE_WS_SOLANA_RPC,
            commitment: "confirmed",
        })
    );


    const subscriptionIdsRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        const connection = connectionRef.current;
        const subscriptionIds = subscriptionIdsRef.current;

        // Clean up previous subscriptions
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_pubkey, id] of subscriptionIds) {
            connection.removeAccountChangeListener(id);
        }
        subscriptionIds.clear();

        // Set up new subscriptions
        tokenAccounts.forEach((account) => {
            const pubkey = new PublicKey(account.pubkey);
            const id = connection.onAccountChange(pubkey, () => {
                onAccountChange(account.pubkey);
            });
            subscriptionIds.set(account.pubkey, id);
        });


        return () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [_pubkey, id] of subscriptionIds) {
                connection.removeAccountChangeListener(id);
            }
            subscriptionIds.clear();
        };
    }, [JSON.stringify(tokenAccounts.map((a) => a.pubkey))]);
};
