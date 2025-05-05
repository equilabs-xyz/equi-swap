export interface PriceChartProps {
    baseAddress: string;
    quoteAddress: string;
    baseLogoURI?: string;
    quoteLogoURI?: string;
    baseSymbol?: string;
    quoteSymbol?: string;
    interval?: string;
    timeFrom: number;
    timeTo: number;
    height?: number;
    lineColor?: string;
}
