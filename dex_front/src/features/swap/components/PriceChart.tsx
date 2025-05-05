// components/PriceChart.tsx
import {useLayoutEffect, useRef, useState} from "react";
import {
    createChart,
    UTCTimestamp,
    IChartApi,
    ISeriesApi,
    LineSeries,
    LineSeriesOptions,
    LineStyle,
} from "lightweight-charts";
import { ColorType } from "lightweight-charts";
import {PriceChartProps} from "@/types";

interface OhlcvItem {
    unixTime: number;
    c: number;
}

interface OhlcvResponse {
    data?: {
        items?: OhlcvItem[];
    };
}

export default function PriceChart(props: PriceChartProps) {
    const {
        baseAddress,
        quoteAddress,
        baseLogoURI,
        quoteLogoURI,
        baseSymbol: propBaseSymbol,
        quoteSymbol: propQuoteSymbol,
        interval = "15m",
        timeFrom,
        timeTo,
        height = 40,
        lineColor = "#22D1F8",
    } = props;

    // safe fallbacks
    const baseSymbol =
        propBaseSymbol ?? (baseAddress ? baseAddress.slice(0, 4) : "");
    const quoteSymbol =
        propQuoteSymbol ?? (quoteAddress ? quoteAddress.slice(0, 4) : "");

    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [changePct, setChangePct] = useState<number | null>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1) create the sparkline chart
        const chart = createChart(container, {
            width: container.clientWidth,
            height,
            layout: {
                background: {type: ColorType.Solid, color: "transparent"},
                textColor: "transparent",
            },
            grid: {
                vertLines: {visible: false},
                horzLines: {visible: false},
            },
            timeScale: {visible: false},
            rightPriceScale: {visible: false},
            leftPriceScale: {visible: false},
            crosshair: {
                mode: 0,
                vertLine: {visible: false},
                horzLine: {visible: false},
            }
        });

        chartRef.current = chart;

        // immediately remove the TV logo
        const logo = container.querySelector("#tv-attr-logo");
        if (logo) logo.remove();

        // 2) add our line series
        seriesRef.current = chart.addSeries(LineSeries, {
            color: lineColor,
            lineStyle: LineStyle.Solid,
            lineWidth: 2,
            priceLineVisible: false,
        } as LineSeriesOptions);

        // 3) fetch & plot closes, compute last/percent
        const url = new URL(
            "https://birdeye-proxy.raydium.io/defi/ohlcv/base_quote",
        );
        url.searchParams.set("base_address", baseAddress);
        url.searchParams.set("quote_address", quoteAddress);
        url.searchParams.set("type", interval);
        url.searchParams.set("time_from", String(timeFrom));
        url.searchParams.set("time_to", String(timeTo));

        fetch(url.toString())
            .then((r) => r.json())
            .then((json: OhlcvResponse) => {
                const items = json.data?.items ?? [];
                if (items.length === 0) return;

                const data = items
                    .map((b) => ({time: b.unixTime as UTCTimestamp, value: b.c}))
                    .sort((a, b) => a.time - b.time);

                seriesRef.current!.setData(data);

                const first = data[0].value;
                const last = data[data.length - 1].value;
                setLastPrice(last);
                setChangePct(((last - first) / first) * 100);
            })
            .catch(console.error);

        // 4) auto resize
        const ro = new ResizeObserver((entries) => {
            const w = entries[0].contentRect.width;
            if (w > 0) chart.resize(w, height);
        });
        ro.observe(container);

        return () => {
            ro.disconnect();
            chart.remove();
        };
    }, [
        baseAddress,
        quoteAddress,
        interval,
        timeFrom,
        timeTo,
        height,
        lineColor,
    ]);

    return (
        <div className="space-y-1">
            {/* header: logos, symbols, last price + % */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1">
                    {baseLogoURI && (
                        <img
                            src={baseLogoURI}
                            alt={baseSymbol}
                            className="w-4 h-4 rounded-full"
                        />
                    )}
                    <span className="text-xs font-medium">{baseSymbol}</span>
                    <span className="text-xs text-muted-foreground">/</span>
                    {quoteLogoURI && (
                        <img
                            src={quoteLogoURI}
                            alt={quoteSymbol}
                            className="w-4 h-4 rounded-full"
                        />
                    )}
                    <span className="text-xs font-medium">{quoteSymbol}</span>
                </div>
                {lastPrice != null && changePct != null && (
                    <div className="flex items-baseline gap-1 text-xs">
                        <span className="font-semibold">{lastPrice.toFixed(6)}</span>
                        <span
                            className={
                                changePct > 0
                                    ? "text-green-500"
                                    : changePct < 0
                                        ? "text-red-500"
                                        : "text-muted-foreground"
                            }
                        >
              {changePct > 0 ? "+" : ""}
                            {changePct.toFixed(2)}%
            </span>
                    </div>
                )}
            </div>

            {/* the sparkline itself */}
            <div
                ref={containerRef}
                className="w-full"
                style={{height, minWidth: 100}}
            />
        </div>
    );
}
