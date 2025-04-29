import { useEffect, useRef } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
export const useNewTokenAccountListener = ({
  publicKey,
  onNewAccount,
}: {
  publicKey: PublicKey | null;
  onNewAccount: () => void;
}) => {
  const connectionRef = useRef(
      new Connection(import.meta.env.VITE_SOLANA_RPC, {
        wsEndpoint: import.meta.env.VITE_WS_SOLANA_RPC,
        commitment: "confirmed",
      })
  );

  const subscriptionIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const connection = connectionRef.current;

    // Filter: token accounts where owner == publicKey
    const filters = [
      {
        memcmp: {
          offset: 32, // Owner offset in SPL Token account
          bytes: publicKey.toBase58(),
        },
      },
    ];

    const id = connection.onProgramAccountChange(
        TOKEN_PROGRAM_ID,
        (info) => {
          onNewAccount(); // or debounce if needed
        },
        {
          commitment: "confirmed",
          filters: [
            {
              memcmp: {
                offset: 32,
                bytes: publicKey.toBase58(),
              },
            },
          ],
        }
    );


    subscriptionIdRef.current = id;

    return () => {
      if (subscriptionIdRef.current !== null) {
        connection.removeProgramAccountChangeListener(
          subscriptionIdRef.current,
        );
      }
    };
  }, [publicKey?.toBase58()]);
};
