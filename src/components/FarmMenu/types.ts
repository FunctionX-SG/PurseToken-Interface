import { BigNumber } from "ethers";

export type FarmPool = {
  id: string;
  latestAPR: string;
  latestFarmBalanceOf: string;
  latestFarmValue: string;
};

export type SubgraphResponse = {
  data: {
    _meta: { block: { timestamp: number } };
    farmPools: FarmPool[];
  };
};

export type PoolSubgraphData = {
  poolApr: number;
  poolTotalStaked: BigNumber;
  poolTvl: number;
};
