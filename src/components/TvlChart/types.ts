export type TvlChartProps = {
  tvlData: TVLData[];
  height: number;
  chartTitle?: string;
  displayHeader?: boolean;
  domainHeightMultiplier?: number;
};

export type TVLData = {
  blockTimestamp: number;
  totalAmountLiquidity: number;
  totalLiquidityValueUSD: number;
};
