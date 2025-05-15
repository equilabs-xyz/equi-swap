// SwapLayout.tsx
import {useCallback, useEffect, useState} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";

import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import Header from "./components/Header";
import TokenInputSection from "./components/TokenInputSection";
import SwapButton from "./components/SwapButton";
import PriceChart from "./components/PriceChart";
import { useSwapStore } from "@/stores/swap-ui";
import { TopTokens as topTokens } from "@/data/top-tokens";
import {
  getMaxSlippage,
  getPriorityFee,
  SwapSettingsDialog,
} from "@/features/swap/components/SwapSettings";
import { useQuoteWebSocket } from "@/features/swap/hooks/useQuoteWebSocket";
import {useHandleSwapClick} from "@/features/swap/hooks/useHandleSwapClick.ts";
import {WrapUnwrapSOLModal} from "@/features/swap/components/WrapUnwrapSOLModal.tsx";
import {SolWsolBalance} from "@/features/swap/components/SolWsolBalance.tsx";
import {useTokenBalancesStore} from "@/stores/token-balances.ts";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export default function SwapLayout() {
  const { connected, publicKey } = useWallet();
  useEffect(() => {
    if (publicKey) {
      fetchBalances(publicKey);
    }
  }, [publicKey]);
  const {
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setOutputAmount,
    setIsOutputUpdating,
    isOutputUpdating,
    swapTokens,
  } = useSwapStore();

  const shortKey = publicKey
      ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
      : "";

  const { balances: tokenBalances, fetchBalances } = useTokenBalancesStore();
  const [chartRefreshTrigger, setChartRefreshTrigger] = useState(0);
  const [rotated, setRotated] = useState(false);
  const inputMint = inputToken?.address;
  const inputBal = inputMint ? tokenBalances[inputMint] ?? 0 : 0;
  const inAmountNum = parseFloat(inputAmount || "0");
  const hasEnoughBalance = inputBal >= inAmountNum && inAmountNum > 0;
  const { connection } = useConnection();

  useEffect(() => {
    const interval = setInterval(() => {
      setChartRefreshTrigger((prev) => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedInput = localStorage.getItem("swap.inputToken");
    const savedOutput = localStorage.getItem("swap.outputToken");

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
      const sol = topTokens.find((t) => t.address === SOL_MINT);
      const usdc = topTokens.find((t) => t.address === USDC_MINT);
      if (sol && usdc) {
        setInputToken(sol);
        setOutputToken(usdc);
        localStorage.setItem("swap.inputToken", JSON.stringify(sol));
        localStorage.setItem("swap.outputToken", JSON.stringify(usdc));
      }
    }
  }, [topTokens]);
  const getSwapMint = (mint: string) =>
      mint === "11111111111111111111111111111111"
          ? "So11111111111111111111111111111111111111112"
          : mint;
  const onQuote = useCallback((expected_out: number) => {
    const formatted = expected_out.toFixed(6);
    setIsOutputUpdating(true);
    setOutputAmount(formatted);
    setTimeout(() => setIsOutputUpdating(false), 300);
  }, []);

  useQuoteWebSocket(
      hasEnoughBalance
          ? {
            signer: publicKey?.toBase58() ?? "",
            x_mint: getSwapMint(inputToken?.address ?? ""),
            y_mint: getSwapMint(outputToken?.address ?? ""),
            amount: inAmountNum,
            slippage: getMaxSlippage(),
            priority_fee: getPriorityFee(),
            onQuote,
          }
          : null
  );

  const handleSwapClick = () => {
    swapTokens();
    setRotated((prev) => !prev);
  };
  const swap = useHandleSwapClick(connection, () => fetchBalances(publicKey!));


  const [modalOpen, setModalOpen] = useState(false);


  const disableSwap =
      !connected || !inputToken || !outputToken || !inputAmount || isOutputUpdating;

  const nowSec = Math.floor(Date.now() / 1000);
  const yesterdaySec = nowSec - 24 * 60 * 60;

  return (
      <div className="flex flex-col max-w-md mx-auto">
        <Header connected={connected} shortKey={shortKey} />
        <div className="flex justify-end p-3">
          <SwapSettingsDialog />
        </div>
        <SolWsolBalance onManage={() => setModalOpen(true)} />
        <WrapUnwrapSOLModal open={modalOpen} onOpenChange={setModalOpen} connection={connection} />

        <div className="max-w-md p-4 mb-3 rounded-2xl shadow-xl space-y-6 border bg-card border-border">
          <TokenInputSection
              label="From"
              token={inputToken}
              onSelect={setInputToken}
              fieldName="inputAmount"
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
              fieldName="outputAmount"
              topTokens={topTokens}
              publicKey={publicKey?.toBase58() ?? ""}
          />

          <SwapButton disabled={disableSwap} onClick={swap}/>
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
