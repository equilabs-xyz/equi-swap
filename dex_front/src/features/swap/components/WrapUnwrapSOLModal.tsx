import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
    createCloseAccountInstruction,
} from "@solana/spl-token";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {useTokenBalancesStore} from "@/stores/token-balances.ts";

const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

export function WrapUnwrapSOLModal({
                                       open,
                                       onOpenChange,
                                       connection,
                                   }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    connection: any;
}) {
    const { publicKey, sendTransaction } = useWallet();
    const [amount, setAmount] = useState("");
    const [tab, setTab] = useState("wrap");
    const { balances, fetchBalances } = useTokenBalancesStore();
    const solBalance = balances["11111111111111111111111111111111"] ?? 0;
    const wsolBalance = balances["So11111111111111111111111111111111111111112"] ?? 0;


    const ata = useMemo(() => {
        if (!publicKey) return null;
        return getAssociatedTokenAddressSync(WSOL_MINT, publicKey, false);
    }, [publicKey]);

    // Fetch balances
    useEffect(() => {
        if (publicKey && open) {
            fetchBalances(publicKey);
        }
    }, [publicKey, open]);

    const handleWrap = async () => {
        if (!publicKey || !sendTransaction || !connection || !amount) return;

        const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
        const tx = new Transaction();

        const ataInfo = await connection.getAccountInfo(ata);
        if (!ataInfo) {
            tx.add(createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, WSOL_MINT));
        }

        tx.add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: ata,
                lamports,
            }),
            new TransactionInstruction({
                keys: [{ pubkey: ata, isSigner: false, isWritable: true }],
                programId: TOKEN_PROGRAM_ID,
                data: Buffer.from([17]), // sync_native
            })
        );

        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "processed");
        onOpenChange(false);
    };

    const handleUnwrap = async () => {
        if (!publicKey || !sendTransaction || !connection) return;
        const tx = new Transaction();

        tx.add(
            createCloseAccountInstruction(
                ata,
                publicKey, // refund SOL to wallet
                publicKey // authority
            )
        );

        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-6 space-y-2 bg-card">
                <h2 className="text-lg font-semibold">Your SOL / wSOL</h2>
                <p className="text-sm text-muted-foreground">
                    You can manually wrap SOL and unwrap wSOL here.
                </p>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="w-full justify-between">
                        <TabsTrigger value="wrap" className="flex-1">Wrap</TabsTrigger>
                        <TabsTrigger value="unwrap" className="flex-1">Unwrap</TabsTrigger>
                    </TabsList>

                    <TabsContent value="wrap" className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Balance {solBalance.toFixed(4)} SOL
                        </p>
                        <Input
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            type="number"
                        />
                        <Button onClick={handleWrap} disabled={!amount || parseFloat(amount) <= 0}>
                            Wrap SOL
                        </Button>
                    </TabsContent>

                    <TabsContent value="unwrap" className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            wSOL Balance: {wsolBalance.toFixed(4)}
                        </p>
                        <Button onClick={handleUnwrap} disabled={wsolBalance === 0}>
                            Unwrap wSOL to SOL
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
