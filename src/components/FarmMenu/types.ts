import { BigNumber } from "ethers";

export type FarmPool = {
  id: string;
  latestAPR: string;
  latestFarmBalanceOf: string;
  latestFarmValue: string;
};

export type PoolSubgraphData = {
  poolApr: number;
  poolTotalStaked: BigNumber;
  poolTvl: number;
};
