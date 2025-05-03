import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import {
  Dialog as TokenDialog,
  DialogContent as TokenDialogContent,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWalletUIStore } from "@/stores/wallet-ui.ts";
import { useTranslation } from "react-i18next";

const CONNECTION_ENDPOINT = import.meta.env.VITE_SOLANA_RPC;

const formSchema = z.object({
  token: z.string().min(1, "Token is required"),
  recipient: z.string().min(32, "Invalid address"),
  amount: z.string().refine((val) => Number(val) > 0, "Amount must be > 0"),
});

export default function WalletSendDialog({
                                           open,
                                           setOpen,
                                           tokenAccounts,
                                           currentToken,
                                           setCurrentToken,
                                           publicKey,
                                           fetchData,
                                         }: any) {
  const {
    selectedToken,
    setSelectedToken,
    tokenSearch,
    setTokenSearch,
    selectOpen,
    setSelectOpen,
  } = useWalletUIStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: "", recipient: "", amount: "" },
  });

  useEffect(() => {
    if (currentToken) {
      form.setValue("token", currentToken.mint);
      setSelectedToken(currentToken);
    }
  }, [currentToken]);

  const filteredTokens = useMemo(() => {
    return tokenAccounts.filter((token: any) => {
      const symbol = token.metadata?.symbol?.toLowerCase() || "";
      return symbol.includes(tokenSearch.toLowerCase());
    });
  }, [tokenSearch, tokenAccounts]);
    const { sendTransaction } = useWallet();
  const { t } = useTranslation();
  const handleSend = async (values: any) => {
    const token = tokenAccounts.find((t: any) => t.mint === values.token);
    if (!publicKey || !token) {
      toast.error(t("wallet.sendErrorMissing"));
      return;
    }

    const toastId = toast.loading(t("wallet.sending"));
    try {
      const connection = new Connection(CONNECTION_ENDPOINT);
      const tx = new Transaction();
      const recipient = new PublicKey(values.recipient);
      const amount = Number(values.amount);
      const decimals = token.metadata?.decimals || token.decimals;
      const amountInUnits = BigInt(
          Math.round(amount * Math.pow(10, decimals))
      );

      if (
          token.mint ===
          "So11111111111111111111111111111111111111112"
      ) {
        tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipient,
              lamports: Number(amountInUnits),
            })
        );
      } else {
        const mint = new PublicKey(token.mint);
        const source = await getAssociatedTokenAddress(mint, publicKey);
        const dest = await getAssociatedTokenAddress(mint, recipient);

        try {
          await getAccount(connection, dest);
        } catch {
          tx.add(
              createAssociatedTokenAccountInstruction(
                  publicKey,
                  dest,
                  recipient,
                  mint
              )
          );
        }

        tx.add(
            createTransferInstruction(source, dest, publicKey, amountInUnits)
        );
      }


      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.success(t("wallet.sendSuccess"), {
        id: toastId,
        description: (
            <a
                href={`https://solscan.io/tx/${signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-accent-foreground"
            >
              {t("wallet.viewOnSolscan")}
            </a>
        ),
      });

      fetchData();
      setOpen(false);
      form.reset();
    } catch (err) {
      toast.error(t("wallet.sendFailed"), {
        id: toastId,
        description: String(err),
      });
      console.error("Send error:", err);
    }
  };

  return (
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="w-full max-w-md rounded-xl p-5 bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {t("wallet.send")}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSend)} className="space-y-6">
              {/* Token selector */}
              <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Button
                              variant="outline"
                              className="w-full h-14 justify-start text-left bg-input text-foreground border-border focus:ring-foreground"
                              onClick={() => setSelectOpen(true)}
                          >
                            {selectedToken ? (
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                        src={selectedToken.metadata?.logoURI}
                                    />
                                    <AvatarFallback>
                                      {selectedToken.metadata?.symbol?.slice(0, 2) ??
                                          "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">
                            {selectedToken.metadata?.symbol ||
                                selectedToken.metadata?.name}
                          </span>
                                </div>
                            ) : (
                                t("tx.selectToken")
                            )}
                          </Button>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Recipient */}
              <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm text-muted-foreground">
                          {t("tx.recipient")}
                        </Label>
                        <FormControl>
                          <Input
                              {...field}
                              placeholder={t("tx.recipientPlaceholder")}
                              className="bg-input text-foreground border-border focus:ring-foreground"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Amount */}
              <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-sm text-muted-foreground">
                            {t("wallet.amount")}
                          </Label>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Balance:{" "}
                        {selectedToken?.balance?.toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        }) ?? "0.0"}
                      </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="px-2 h-6 text-xs text-foreground"
                                onClick={() =>
                                    form.setValue(
                                        "amount",
                                        selectedToken?.balance
                                            ? (
                                                Number(selectedToken.balance) / 2
                                            ).toFixed(6)
                                            : ""
                                    )
                                }
                            >
                              50%
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="px-2 h-6 text-xs text-foreground"
                                onClick={() =>
                                    form.setValue(
                                        "amount",
                                        selectedToken?.balance?.toString() || ""
                                    )
                                }
                            >
                              {t("swap.max")}
                            </Button>
                          </div>
                        </div>
                        <FormControl>
                          <Input
                              {...field}
                              type="number"
                              className="bg-input text-foreground border-border focus:ring-foreground"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-border text-foreground"
                    onClick={() => setOpen(false)}
                >
                  {t("wallet.cancel")}
                </Button>
                <Button type="submit" className="flex-1">
                  {t("wallet.send")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>

        {/* Token selection dialog */}
        <TokenDialog open={selectOpen} onOpenChange={setSelectOpen}>
          <TokenDialogContent className="w-full max-w-md p-5 bg-background text-foreground">
            <Input
                placeholder={t("token.search")}
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="mb-3 bg-input text-foreground border-border focus:ring-foreground"
            />
            <ScrollArea className="max-h-72">
              {filteredTokens.map((token: any) => (
                  <button
                      key={token.mint}
                      type="button"
                      onClick={() => {
                        form.setValue("token", token.mint);
                        setSelectedToken(token);
                        setCurrentToken(token);
                        setSelectOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-muted transition"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={token.metadata?.logoURI} />
                      <AvatarFallback>
                        {token.metadata?.symbol?.slice(0, 2) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {token.metadata?.name || token.metadata?.symbol}
                  </span>
                      <span className="text-xs text-muted-foreground">
                    {token.metadata?.symbol}
                  </span>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                  {token.balance?.toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  }) ?? "0.0"}
                </span>
                  </button>
              ))}
            </ScrollArea>
          </TokenDialogContent>
        </TokenDialog>
      </Dialog>
  );
}
