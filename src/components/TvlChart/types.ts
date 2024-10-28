export type TvlChartProps = {
  tvlData: TVLData[];
  height: number;
  chartTitle?: string;
  displayHeader?: boolean;
  displayTokenAmount?: boolean;
  domainHeightMultiplier?: number;
  size?: "s" | "m";
  yAxisLabel?: string;
  dataKey: string;
  yAxisFormatter: (val: number) => string;
  tooltipFormatter: (val: number) => string;
};

export type TVLData = {
  blockTimestamp: number;
  totalAmountLiquidity: number;
  totalLiquidityValueUSD: number;
};
