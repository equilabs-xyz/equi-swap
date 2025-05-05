// SwapLayout.tsx
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

import Header from "./components/Header";
import TokenInputSection from "./components/TokenInputSection";
import SwapButton from "./components/SwapButton";
import PriceChart from "./components/PriceChart";
import { useTokenBalances } from "./hooks/useTokenBalances";
import { useSwapStore } from "@/stores/swap-ui.ts";
import { TopTokens as topTokens } from "@/data/top-tokens"; // correct path to where you define topTokens

// Raydium SOL/USDC mint addresses
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const formSchema = z.object({
  inputAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Invalid amount"),
  outputAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Invalid amount"),
});

export default function SwapLayout() {
  const { connected, publicKey } = useWallet();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { inputAmount: "", outputAmount: "" },
  });

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  const { balances: tokenBalances } = useTokenBalances(publicKey);
  const { inputToken, outputToken, setInputToken, setOutputToken, swapTokens } =
    useSwapStore();

  const [rotated, setRotated] = useState(false);
  const handleSwapClick = () => {
    swapTokens();
    setRotated((prev) => !prev);
  };
  const [chartRefreshTrigger, setChartRefreshTrigger] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartRefreshTrigger((prev) => prev + 1);
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Default to SOL -> USDC on first load
  useEffect(() => {
    // Only run this once on mount
    const savedInput = localStorage.getItem("swap.inputToken");
    const savedOutput = localStorage.getItem("swap.outputToken");

    // If both saved, parse and use them
    if (savedInput && savedOutput) {
      try {
        const parsedInput = JSON.parse(savedInput);
        const parsedOutput = JSON.parse(savedOutput);
        if (!inputToken && !outputToken) {
          setInputToken(parsedInput);
          setOutputToken(parsedOutput);
        }
      } catch (e) {
        console.error("Failed to parse swap tokens from localStorage", e);
      }
    } else if (!inputToken && !outputToken && topTokens.length > 0) {
      // Fallback to SOL/USDC if nothing in localStorage
      const sol = topTokens.find((t) => t.address === SOL_MINT);
      const usdc = topTokens.find((t) => t.address === USDC_MINT);
      if (sol && usdc) {
        setInputToken(sol);
        setOutputToken(usdc);
        localStorage.setItem("swap.inputToken", JSON.stringify(sol));
        localStorage.setItem("swap.outputToken", JSON.stringify(usdc));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topTokens]);



  const disableSwap =
    !connected || !inputToken || !outputToken || !form.watch("inputAmount");

  // Calculate chart timeframe: last 24h
  const nowSec = Math.floor(Date.now() / 1000);
  const yesterdaySec = nowSec - 24 * 60 * 60;

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <Header connected={connected} shortKey={shortKey} />
      <div className="max-w-md p-4 rounded-2xl shadow-xl space-y-6 border bg-card border-border">
        <TokenInputSection
          label="From"
          token={inputToken}
          onSelect={setInputToken}
          form={form}
          fieldName="inputAmount"
          tokenBalances={tokenBalances}
          topTokens={topTokens}
          publicKey={publicKey?.toBase58() ?? ""}
          allowMax
        />

        <div className="flex justify-center items-center">
          <ArrowsUpDownIcon
            onClick={handleSwapClick}
            className={`w-6 h-6 text-muted-foreground cursor-pointer transition-transform duration-300 ${
              rotated ? "rotate-180" : "rotate-0"
            } hover:text-primary`}
          />
        </div>

        <TokenInputSection
          label="To"
          token={outputToken}
          onSelect={setOutputToken}
          form={form}
          fieldName="outputAmount"
          tokenBalances={tokenBalances}
          topTokens={topTokens}
          publicKey={publicKey?.toBase58() ?? ""}
        />

        <SwapButton disabled={disableSwap} />
      </div>
      {inputToken && outputToken && (
        <div className="p-4 bg-card border border-border rounded-2xl">
          <PriceChart
              key={chartRefreshTrigger}
            baseAddress={inputToken.address}
            quoteAddress={outputToken.address}
            baseLogoURI={inputToken.logoURI}
            quoteLogoURI={outputToken.logoURI}
            baseSymbol={inputToken.symbol}
            quoteSymbol={outputToken.symbol}
            interval="15m"
            timeFrom={yesterdaySec}
            timeTo={nowSec}
            height={80}
            lineColor="#22D1F8"
          />
        </div>
      )}
    </div>
  );
}
