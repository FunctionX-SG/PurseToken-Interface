import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import purse2 from "../../assets/images/purse2.png";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Buttons from "react-bootstrap/Button";
import "../App.css";
import { Popup as ReactPopup } from "reactjs-popup";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { FaExclamationCircle } from "react-icons/fa";
import PurseFarm from "../../farm/farmPurse.json";
import { BigNumber, ethers } from "ethers";
import * as Constants from "../../constants";
import { formatBigNumber, readContract, fetcher } from "../utils";
import { useWeb3React } from "@web3-react/core";
import { Loading } from "../Loading";
import PoolCard from "../PoolCard";
import useSWR from "swr";
import { useContract } from "../state/contract/hooks";
import IPancakePair from "../../abis/IPancakePair.json";
import { useProvider } from "../state/provider/hooks";
import { PoolSubgraphData, SubgraphResponse } from "./types";
import SubgraphDelayWarning from "../alerts";

export default function FarmMenu() {
  const farmNetwork = "MAINNET";
  const { account, isActive, chainId } = useWeb3React();
  const { bscProvider } = useProvider();

  const { restakingFarm, purseTokenUpgradable } = useContract();

  const [totalPendingReward, setTotalPendingReward] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [tvl, setTvl] = useState<number[]>([]);
  const [apr, setApr] = useState<number[]>([]);
  const [apyDaily, setApyDaily] = useState<number[]>([]);
  const [apyWeekly, setApyWeekly] = useState<number[]>([]);
  const [apyMonthly, setApyMonthly] = useState<number[]>([]);
  const [aprloading, setAprLoading] = useState(false);
  const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [totalRewardPerBlock, setTotalRewardPerBlock] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [poolInfos, setPoolInfos] = useState<any>([]);
  const [userInfos, setUserInfos] = useState<any>([]);
  const [stakeBalances, setStakeBalances] = useState<any>([]);
  const [farmLoading, setFarmLoading] = useState<Boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [subgraphDelay, setSubgraphDelay] = useState(false);

  const { data: purseTokenUpgradableBalance } = useSWR(
    {
      contract: "purseTokenUpgradable",
      method: "balanceOf",
      params: [account],
    },
    {
      fetcher: fetcher(purseTokenUpgradable),
      refreshInterval: 5000,
    }
  );

  const fetchFromSubgraph = async (): Promise<
    Map<string, PoolSubgraphData>
  > => {
    try {
      const response = await fetch(Constants.SUBGRAPH_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
          {
            _meta {
              block {
                timestamp
              }
            }
            farmPools {
              id
              latestAPR
              latestFarmBalanceOf
              latestFarmValue
            }
          }
        `,
        }),
      });

      const json: SubgraphResponse = await response.json();
      const currentTimestamp = Math.round(Date.now() / 1000);
      if (
        currentTimestamp - json.data._meta.block.timestamp >
        Constants.SUBGRAPH_DELAY_TOLERANCE_MS
      ) {
        setSubgraphDelay(true);
      }
      const addressToInfoMap = new Map<string, PoolSubgraphData>();

      if (!json.data?.farmPools) {
        throw new Error("Invalid response format from subgraph");
      }

      json.data.farmPools.forEach((pool) => {
        const entryData: PoolSubgraphData = {
          poolApr: parseFloat(pool.latestAPR),
          poolTotalStaked: BigNumber.from(pool.latestFarmBalanceOf),
          poolTvl: parseFloat(pool.latestFarmValue),
        };
        addressToInfoMap.set(pool.id.toLowerCase(), entryData);
      });

      return addressToInfoMap;
    } catch (error) {
      console.error("Error fetching from subgraph:", error);
      throw error;
    }
  };

  const loadData = useCallback(async () => {
    let _poolLength = await restakingFarm.poolLength();
    _poolLength = parseFloat(_poolLength.toString());

    const _purseTokenTotalSupply = await purseTokenUpgradable.totalSupply();
    setPurseTokenTotalSupply(_purseTokenTotalSupply);

    setIsLoading(false);

    const farm = PurseFarm.farm;
    let _pendingRewards: string[] = [];
    let _totalRewardPerBlock: BigNumber = BigNumber.from("0");
    let _totalPendingReward: BigNumber = BigNumber.from("0");
    let _poolInfos: any[] = farm;
    let _userInfos: any[] = [];

    let _tvl: number[] = [];
    let _apr: number[] = [];
    let _apyDaily: number[] = [];
    let _apyWeekly: number[] = [];
    let _apyMonthly: number[] = [];
    let _stakeBalances: BigNumber[] = [];

    // Mainnet: 0:Purse-BUSD (deprecated) 1:Purse-USDT
    // Testnet: 0:Purse-USDT

    const subgraphResponse: Map<string, PoolSubgraphData> =
      await fetchFromSubgraph();

    ////// Mainnet /////
    for (let i = 0; i < _poolLength; i++) {
      const _lpAddress: string = await readContract(
        restakingFarm,
        "poolTokenList",
        i
      );

      const poolInfoPromise = readContract(
        restakingFarm,
        "poolInfo",
        _lpAddress.toString()
      ).then((poolInfo) => {
        _totalRewardPerBlock = _totalRewardPerBlock.add(
          poolInfo.pursePerBlock?.mul(poolInfo.bonusMultiplier)
        );
      });

      const pendingRewardPromise = readContract(
        restakingFarm,
        "pendingReward",
        _lpAddress,
        account
      ).then((pendingReward) => {
        _pendingRewards.push(pendingReward);
        _totalPendingReward = _totalPendingReward.add(
          pendingReward ? pendingReward : 0
        );
      });

      const userInfoPromise = readContract(
        restakingFarm,
        "userInfo",
        _lpAddress,
        account
      ).then((userInfo) => {
        _userInfos.push(userInfo ? userInfo.amount : "NaN");
      });

      const lpContract = await new ethers.Contract(
        _lpAddress,
        IPancakePair.abi,
        bscProvider
      );

      const stakedBalancePromise = readContract(
        lpContract,
        "balanceOf",
        Constants.RESTAKING_FARM_ADDRESS
      ).then((stakedBalance) => {
        _stakeBalances.push(stakedBalance);
      });

      const subgraphData = subgraphResponse.get(_lpAddress.toLowerCase());

      _tvl.push(subgraphData?.poolTvl || 0);
      const apr = subgraphData?.poolApr || 0;
      _apr.push(apr);

      _apyDaily.push((Math.pow(1 + (0.8 * apr) / 36500, 365) - 1) * 100);
      _apyWeekly.push((Math.pow(1 + (0.8 * apr) / 5200, 52) - 1) * 100);
      _apyMonthly.push((Math.pow(1 + (0.8 * apr) / 1200, 12) - 1) * 100);

      await Promise.all([
        poolInfoPromise,
        pendingRewardPromise,
        userInfoPromise,
        stakedBalancePromise,
      ]);
    }

    ////// Testnet //////
    // const _lpAddress = await readContract(restakingFarm,"poolTokenList",0)
    // const _poolInfo = await readContract(restakingFarm,"poolInfo",_lpAddress.toString())
    // _totalRewardPerBlock = _totalRewardPerBlock.add(_poolInfo.pursePerBlock?.mul(_poolInfo.bonusMultiplier))

    // const lpContract = new ethers.Contract(_lpAddress, IPancakePair.abi, bscProvider)

    // const stakedBalance = await readContract(lpContract,"balanceOf",Constants.RESTAKING_FARM_ADDRESS)

    // const _pendingReward = await readContract(restakingFarm,"pendingReward",_lpAddress, account)
    // _pendingRewards.push(_pendingReward)
    // _totalPendingReward = _totalPendingReward.add(_pendingReward?_pendingReward:0)

    // const _userInfo = await readContract(restakingFarm,"userInfo",_lpAddress, account)
    // _userInfos.push(_userInfo ? _userInfo.amount : 'NaN')

    // _tvl.push(tvlArray?.[1].tvl||0)
    // _apr.push(aprArray?.[1].apr||0)
    // _stakeBalances.push(stakedBalance)
    // _apyDaily.push((Math.pow((1 + 0.8 * aprArray?.[1].apr / 36500), 365) - 1) * 100)
    // _apyWeekly.push((Math.pow((1 + 0.8 * aprArray?.[1].apr / 5200), 52) - 1) * 100)
    // _apyMonthly.push((Math.pow((1 + 0.8 * aprArray?.[1].apr / 1200), 12) - 1) * 100)
    ////////

    setTotalPendingReward(_totalPendingReward);
    setTotalRewardPerBlock(_totalRewardPerBlock);
    setPoolInfos(_poolInfos);
    setUserInfos(_userInfos);
    setStakeBalances(_stakeBalances);

    setTvl(_tvl);
    setApr(_apr);
    setApyDaily(_apyDaily);
    setApyWeekly(_apyWeekly);
    setApyMonthly(_apyMonthly);
    setAprLoading(true);
    setFarmLoading(false);
    setIsUserLoading(false);
  }, [account, bscProvider, purseTokenUpgradable, restakingFarm]);

  useEffect(() => {
    loadData();
  }, [
    account,
    isActive,
    chainId,
    purseTokenUpgradable,
    restakingFarm,
    loadData,
  ]);

  return (
    <div style={{ margin: "0 auto", maxWidth: "1000px" }}>
      <div id="content" className="mt-3">
        <div className="text-center">
          <ButtonGroup>
            <Link to="/lpfarm/menu/" style={{ textDecoration: "none" }}>
              <Buttons
                className="textPurpleMedium center hover lpfarm"
                variant="outline"
                size="lg"
              >
                {" "}
                PANCAKESWAP
              </Buttons>
            </Link>
            <Link to="/lpfarm/fxswap/" style={{ textDecoration: "none" }}>
              <Buttons
                className="textWhiteMedium center hover lpfarm"
                variant="link"
                size="lg"
              >
                {" "}
                MarginX
              </Buttons>
            </Link>
          </ButtonGroup>
        </div>
        <div className="center img">
          <img src={purse2} height="180" alt="" />
        </div>
        <h1
          className="textWhite center"
          style={{ fontSize: "40px", textAlign: "center" }}
        >
          <b>LP Restaking Farm</b>
        </h1>
        <div
          className="center mt-4 mb-3"
          style={{ color: "#999", textAlign: "center" }}
        >
          Stake Pancakeswap LP Tokens to earn PURSE&nbsp;!
        </div>
        <br />

        <div className="row center" style={{ minWidth: "300px" }}>
          <div className="card mb-4 cardbody" style={{ width: "350px" }}>
            <div className="card-body">
              <span>
                <span className="float-left">
                  Your PURSE Balance&nbsp;
                  <ReactPopup
                    trigger={(open) => (
                      <span style={{ position: "relative", top: "-1px" }}>
                        <BsFillQuestionCircleFill size={12} />
                      </span>
                    )}
                    on="hover"
                    position="right center"
                    offsetY={-23}
                    offsetX={5}
                    contentStyle={{ padding: "3px" }}
                  >
                    <span className="textInfo">
                      <small>
                        The amount shown is the PURSE balance on BSC for the
                        address you are currently connected to.
                      </small>
                    </span>
                  </ReactPopup>
                  <br />
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <b>
                      {parseFloat(
                        formatBigNumber(purseTokenUpgradableBalance, "ether")
                      ).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </b>
                  )}
                </span>
                <br />
                <br />
                <br />
              </span>
              <span>
                <small>
                  <span className="float-left">Total Pending Harvest</span>
                  <span className="float-right">
                    {isLoading ? (
                      <span>
                        <Loading />
                      </span>
                    ) : (
                      <span>
                        {parseFloat(
                          formatBigNumber(totalPendingReward, "ether")
                        ).toLocaleString("en-US", { maximumFractionDigits: 3 })}
                        &nbsp;PURSE
                      </span>
                    )}
                  </span>
                </small>
              </span>
            </div>
          </div>
          <li style={{ color: "transparent" }} />

          <div className="card mb-4 cardbody" style={{ width: "350px" }}>
            <div className="card-body">
              <span>
                <span className="float-left">
                  Total PURSE Supply&nbsp;
                  <ReactPopup
                    trigger={(open) => (
                      <span style={{ position: "relative", top: "-1px" }}>
                        <BsFillQuestionCircleFill size={12} />
                      </span>
                    )}
                    on="hover"
                    position="right center"
                    offsetY={-23}
                    offsetX={5}
                    contentStyle={{ padding: "3px" }}
                  >
                    <span className="textInfo">
                      <small>
                        The amount shown is the Total PURSE Supply on BSC
                        network.
                      </small>
                    </span>
                  </ReactPopup>
                  <br />
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <b>
                      {parseFloat(
                        formatBigNumber(purseTokenTotalSupply, "ether")
                      ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </b>
                  )}
                </span>
                <br />
                <br />
                <br />
                <span>
                  <small>
                    <span className="float-left">Total Reward / Block</span>
                    <span className="float-right">
                      {isLoading ? (
                        <span>
                          <Loading />
                        </span>
                      ) : (
                        <span>
                          {parseFloat(
                            formatBigNumber(totalRewardPerBlock, "ether")
                          ).toLocaleString("fullwide", { useGrouping: false })}
                          &nbsp;PURSE
                        </span>
                      )}
                    </span>
                  </small>
                </span>
              </span>
            </div>
          </div>
          <li style={{ color: "transparent" }} />
        </div>

        <br />
        <div className="center mt-4 mb-2">
          <b>
            <big>Select Your Favourite pool entrees&nbsp;!</big>
          </b>
        </div>
        <div className="center" style={{ color: "#999" }}>
          <small>
            <FaExclamationCircle size={13} style={{ marginBottom: "3px" }} />
            &nbsp;&nbsp;Attention&nbsp;: Be sure to familiar with protocol risks
            and fees before using the farms&nbsp;!
          </small>
        </div>
        <br />
        {subgraphDelay ? <SubgraphDelayWarning /> : null}

        {!farmLoading ? (
          <div className="row center mt-4">
            {poolInfos.map((poolInfo: any, key: number) => (
              <PoolCard
                key={`${poolInfos[key].token[farmNetwork]["symbol"]}-${poolInfos[key].quoteToken[farmNetwork]["symbol"]}`}
                pairName={`${poolInfos[key].token[farmNetwork]["symbol"]}-${poolInfos[key].quoteToken[farmNetwork]["symbol"]}`}
                stakeBalance={stakeBalances[key]}
                aprloading={aprloading}
                apr={apr[key]}
                apyDaily={apyDaily[key]}
                apyWeekly={apyWeekly[key]}
                apyMonthly={apyMonthly[key]}
                targetChainId={Number(
                  poolInfos[key].token[farmNetwork]["chainId"]
                )}
                poolInfo={poolInfos[key]}
                userInfo={userInfos[key]}
                isUserLoading={isUserLoading}
                tvl={tvl[key]}
              />
            ))}
          </div>
        ) : (
          <div className="center">
            <div className="bounceball"></div> &nbsp;
            <div className="textLoadingSmall">NETWORK IS Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}
