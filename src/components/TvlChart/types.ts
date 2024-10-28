export type TvlChartProps = {
  tvlData: TVLData[];
  height: number;
  chartTitle?: string;
  displayHeader?: boolean;
  displayTokenAmount?: boolean;
  domainHeightMultiplier?: number;
  size?: "s" | "m";
};

export type TVLData = {
  blockTimestamp: number;
  totalAmountLiquidity: number;
  totalLiquidityValueUSD: number;
};
