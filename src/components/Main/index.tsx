import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import MediaQuery from "react-responsive";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { IoStar } from "react-icons/io5";
import { formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import * as Constants from "../../constants";
import { Loading } from "../Loading";
import { usePursePrice } from "../state/PursePrice/hooks";
import { useContract } from "../state/contract/hooks";
import {
  convertUnixToDate,
  formatBigNumber,
  RawDataFormatter,
  RawNumberFormatter,
} from "../utils";
import { Bounce } from "react-awesome-reveal";

interface CustomTooltipProps {
  payload?: any[];
  label?: string;
  formatter: (arg0: number) => string;
}

export default function Main() {
  const [selectedTab, setSelectedTab] = useState("main");
  const [PURSEPrice] = usePursePrice();
  const { restakingFarm, purseTokenUpgradable } = useContract();

  const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(
    BigNumber.from("0")
  );
  // PURSE DASHBOARD STATES
  const [totalBurnAmount, setTotalBurnAmount] = useState("0");
  const [totalTransferAmount, setTotalTransferAmount] = useState("0");
  const [cumulateTransfer, setCumulateTransfer] = useState<
    { totalAmountLiquidity: number; blockTimestamp: string }[]
  >([]);
  const [cumulateBurn, setCumulateBurn] = useState<
    { totalAmountBurned: number; blockTimestamp: string }[]
  >([]);

  // FARM DASHBOARD STATES
  const [totalRewardPerBlock, setTotalRewardPerBlock] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [poolLength, setPoolLength] = useState<number>(0);
  const [poolCapRewardToken, setPoolCapRewardToken] = useState("0");
  const [poolMintedRewardToken, setPoolMintedRewardToken] = useState("0");
  const [poolRewardToken, setPoolRewardToken] = useState("0");
  const [isFetchMainDataLoading, setIsFetchMainDataLoading] = useState(true);
  const [isFetchFarmDataLoading, setIsFetchFarmDataLoading] = useState(true);

  const CustomTick = (propsCustomTick: {
    x: number;
    y: number;
    payload: { value: number };
  }) => {
    const { x, y, payload } = propsCustomTick;
    const date = new Date(payload.value * 1000);
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "short" });

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={25} textAnchor="middle" fontSize={16}>
          {month}
        </text>
        <text x={0} y={46} textAnchor="middle" fontSize={12}>
          {year}
        </text>
      </g>
    );
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    payload,
    label,
    formatter,
  }) => {
    if (payload && payload.length) {
      const date = new Date(1000 * Number(label));
      const year = date.getFullYear();
      const month = date.toLocaleString("en-US", { month: "long" });
      const day = date.getDate();
      const value = parseFloat(payload[0].value);
      const formattedValue = formatter(value);

      return (
        <div className="custom-tooltip">
          <p
            className="textWhiteSmall"
            style={{
              padding: "0",
              margin: "0",
              textAlign: "center",
              width: "40px",
              height: "18px",
              color: "#fff",
              lineHeight: "18px",
              backgroundColor: "var(--basic-black)",
            }}
          >
            SUM
          </p>
          <div
            className="textWhiteHeading"
            style={{
              color: "#000",
              padding: "0",
              margin: "0",
            }}
          >
            {formattedValue}
          </div>
          <p
            className="textWhiteSmall"
            style={{
              color: "#000",
              padding: "0",
              margin: "0",
            }}
          >
            {day}-{month}-{year}
          </p>
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    async function loadData() {
      // trigger fetching data
      const _purseTokenTotalSupply = purseTokenUpgradable._totalSupply();
      const subgraphPromise = fetch(Constants.SUBGRAPH_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
              {
                burns(first: 1000, orderBy: blockTimestamp) {
                  blockTimestamp
                  totalAmountBurned
                }
                  liquidities(first: 1000, orderBy: blockTimestamp) {
                  blockTimestamp
                  totalAmountLiquidity
                }
                store(id: "1") {
                  prevBurnDate
                  accBurned
                  prevLiquidityDate
                  accLiquidity
                }
              }
            `,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          const liquidities = json.data.liquidities;
          const burns = json.data.burns;
          const store = json.data.store;
          const lastLiquidity = store.accLiquidity;
          const lastBurn = store.accBurned;
          const currentTimestamp = (Date.now() / 1000).toFixed(0);
          if (lastLiquidity) {
            liquidities.push({
              blockTimestamp: store.prevLiquidityDate,
              totalAmountLiquidity: lastLiquidity,
            });
            liquidities.push({
              blockTimestamp: currentTimestamp,
              totalAmountLiquidity: lastLiquidity,
            });
            setTotalTransferAmount(lastLiquidity);
          }
          if (lastBurn) {
            burns.push({
              blockTimestamp: store.prevBurnDate,
              totalAmountBurned: lastBurn,
            });
            burns.push({
              blockTimestamp: currentTimestamp,
              totalAmountBurned: lastBurn,
            });
            setTotalBurnAmount(lastBurn);
          }
          setCumulateTransfer(liquidities);
          setCumulateBurn(burns);
        })
        .catch((e) => {
          console.error(e);
        });
      setPurseTokenTotalSupply(await _purseTokenTotalSupply);

      await subgraphPromise;
      setIsFetchMainDataLoading(false);
    }

    loadData();
  }, [purseTokenUpgradable]);

  useEffect(() => {
    async function loadData() {
      // trigger fetching data
      let _poolLength = restakingFarm.poolLength();
      const _poolCapRewardToken = restakingFarm.capMintToken();
      const _poolMintedRewardToken = restakingFarm.totalMintToken();
      const _poolRewardToken = purseTokenUpgradable.balanceOf(
        Constants.RESTAKING_FARM_ADDRESS
      );

      // start setting
      _poolLength = parseFloat((await _poolLength).toString());
      setPoolLength(_poolLength);
      setPoolCapRewardToken(await _poolCapRewardToken);
      setPoolMintedRewardToken(await _poolMintedRewardToken);
      setPoolRewardToken(await _poolRewardToken);

      let _totalRewardPerBlock: BigNumber = BigNumber.from("0");

      for (let i = 0; i < _poolLength; i++) {
        const _poolAddress = await restakingFarm.poolTokenList(i);
        const _poolInfo = await restakingFarm.poolInfo(_poolAddress.toString());
        _totalRewardPerBlock = _totalRewardPerBlock.add(
          _poolInfo.pursePerBlock?.mul(_poolInfo.bonusMultiplier)
        );
      }
      setTotalRewardPerBlock(_totalRewardPerBlock);
      setIsFetchFarmDataLoading(false);
    }

    loadData();
  }, [purseTokenUpgradable, restakingFarm]);
  console.log(cumulateBurn);
  console.log(cumulateTransfer);
  const renderFullMainTable = () => {
    return (
      <div className="card mb-4 cardbody">
        <div className="card-body center">
          <table className="textWhiteSmall" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th scope="col">Market Cap</th>
                <th scope="col">
                  Circulating Supply{" "}
                  <span className="">
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="bottom center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "3px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        Currently based on the total supply of PURSE token{" "}
                      </span>
                    </Popup>
                  </span>
                </th>
                <th scope="col">PURSE Token Price</th>
              </tr>
            </thead>
            <tbody>
              {isFetchMainDataLoading ? (
                <tr>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>
                    $
                    {(
                      parseFloat(formatUnits(purseTokenTotalSupply, "ether")) *
                      PURSEPrice
                    ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>
                  <td>
                    {parseFloat(
                      formatUnits(purseTokenTotalSupply, "ether")
                    ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>
                  <td>
                    $
                    {parseFloat(PURSEPrice.toString()).toLocaleString("en-US", {
                      maximumFractionDigits: 6,
                    })}
                  </td>
                </tr>
              )}
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">
                  Burn{" "}
                  <span className="">
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="right center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "1px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        (Unit in Token / Unit in USD)
                      </span>
                    </Popup>
                  </span>
                </th>

                <th scope="col">
                  Distribution{" "}
                  <span className="">
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="bottom center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "1px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        (Unit in Token / Unit in USD)
                      </span>
                    </Popup>
                  </span>
                </th>

                <th scope="col">
                  Liquidity{" "}
                  <span className="">
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="left center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "1px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        (Unit in Token / Unit in USD){" "}
                      </span>
                    </Popup>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="col">(Total)</th>
                <th scope="col">(Total)</th>
                <th scope="col">(Total)</th>
              </tr>
            </tbody>
            <tbody>
              {isFetchMainDataLoading ? (
                <tr>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>
                    {parseFloat(
                      formatUnits(totalBurnAmount, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    / ${" "}
                    {(
                      parseFloat(formatUnits(totalBurnAmount, "ether")) *
                      PURSEPrice
                    ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>
                  <td>
                    {parseFloat(
                      formatUnits(totalTransferAmount, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    / ${" "}
                    {(
                      parseFloat(formatUnits(totalTransferAmount, "ether")) *
                      PURSEPrice
                    ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>
                  <td>
                    {parseFloat(
                      formatUnits(totalTransferAmount, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    / ${" "}
                    {(
                      parseFloat(formatUnits(totalTransferAmount, "ether")) *
                      PURSEPrice
                    ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              )}
            </tbody>
            {/*<thead>*/}
            {/*<tr>*/}
            {/*  <th scope="col">(Past 30 days Sum)</th>*/}
            {/*  <th scope="col">(Past 30 days Sum)</th>*/}
            {/*  <th scope="col">(Past 30 days Sum)</th>*/}
            {/*</tr>*/}
            {/*</thead>*/}
            {/*<tbody>*/}
            {/*{isFetchMainDataLoading ? (*/}
            {/*  <tr>*/}
            {/*    <td>*/}
            {/*      <Loading/>*/}
            {/*    </td>*/}
            {/*    <td>*/}
            {/*      <Loading/>*/}
            {/*    </td>*/}
            {/*    <td>*/}
            {/*      <Loading/>*/}
            {/*    </td>*/}
            {/*  </tr>*/}
            {/*) : (*/}
            {/*  <tr>*/}
            {/*    <td>*/}
            {/*      {parseFloat(*/}
            {/*        formatUnits(sum30BurnAmount, "ether")*/}
            {/*      ).toLocaleString("en-US", {*/}
            {/*        maximumFractionDigits: 0,*/}
            {/*      })}{" "}*/}
            {/*      / ${" "}*/}
            {/*      {(*/}
            {/*        parseFloat(formatUnits(sum30BurnAmount, "ether")) **/}
            {/*        PURSEPrice*/}
            {/*      ).toLocaleString("en-US", {maximumFractionDigits: 0})}*/}
            {/*    </td>*/}
            {/*    <td>*/}
            {/*      {parseFloat(*/}
            {/*        formatUnits(sum30TransferAmount, "ether")*/}
            {/*      ).toLocaleString("en-US", {*/}
            {/*        maximumFractionDigits: 0,*/}
            {/*      })}{" "}*/}
            {/*      / ${" "}*/}
            {/*      {(*/}
            {/*        parseFloat(formatUnits(sum30TransferAmount, "ether")) **/}
            {/*        PURSEPrice*/}
            {/*      ).toLocaleString("en-US", {maximumFractionDigits: 0})}*/}
            {/*    </td>*/}
            {/*    <td>*/}
            {/*      {parseFloat(*/}
            {/*        formatUnits(sum30TransferAmount, "ether")*/}
            {/*      ).toLocaleString("en-US", {*/}
            {/*        maximumFractionDigits: 0,*/}
            {/*      })}{" "}*/}
            {/*      / ${" "}*/}
            {/*      {(*/}
            {/*        parseFloat(formatUnits(sum30TransferAmount, "ether")) **/}
            {/*        PURSEPrice*/}
            {/*      ).toLocaleString("en-US", {maximumFractionDigits: 0})}*/}
            {/*    </td>*/}
            {/*  </tr>*/}
            {/*)}*/}
            {/*</tbody>*/}
          </table>
        </div>
      </div>
    );
  };

  const renderFullFarmTable = () => {
    return (
      <div className="card mb-2 cardbody">
        <div className="card-body center">
          <table
            className="textWhiteSmall text-center"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th scope="col">Total Pool</th>
                <th scope="col">PURSE Token Total Supply</th>
                <th scope="col">Farm's PURSE Reward</th>
              </tr>
            </thead>
            <tbody>
              {isFetchFarmDataLoading ? (
                <tr>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>{poolLength.toString()}</td>
                  <td>
                    {parseFloat(
                      formatBigNumber(purseTokenTotalSupply, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    Purse
                  </td>
                  <td>
                    {parseFloat(
                      formatBigNumber(totalRewardPerBlock, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 3,
                    })}{" "}
                    Purse per block
                  </td>
                </tr>
              )}
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">Farm's Cap Reward Token</th>
                <th scope="col">Farm's Minted Reward Token</th>
                <th scope="col">Farm's PURSE Balance</th>
              </tr>
            </thead>
            <tbody>
              {isFetchFarmDataLoading ? (
                <tr>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                  <td>
                    <Loading />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>
                    {parseFloat(
                      formatBigNumber(poolCapRewardToken, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    Purse
                  </td>
                  <td>
                    {parseFloat(
                      formatBigNumber(poolMintedRewardToken, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    Purse
                  </td>
                  <td>
                    {parseFloat(
                      formatBigNumber(poolRewardToken, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    Purse
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFullTable = () => {
    return (
      <>
        <div style={{ display: selectedTab === "main" ? "block" : "none" }}>
          {renderFullMainTable()}
        </div>
        <div style={{ display: selectedTab === "farm" ? "block" : "none" }}>
          {renderFullFarmTable()}
        </div>
        {/* <div style={{display: selectedTab === "vault" ? "block" : "none"}}>
            {renderFullVaultTable()}
          </div> */}
      </>
    );
  };

  const renderFullCharts = () => {
    return (
      <div
        className="container pt-4"
        style={{
          display: selectedTab === "main" ? "block" : "none",
          width: "fit-content",
        }}
      >
        <label
          className="textWhite center mb-2 pt-4"
          style={{ fontSize: "40px", textAlign: "center" }}
        >
          <big>
            <b>CHARTS</b>
          </big>
        </label>
        <div className="row center" style={{ gap: "20px" }}>
          <div>
            <div
              className={`common-title`}
              style={{ marginBottom: "40px", textAlign: "center" }}
            >
              Burn
            </div>
            <AreaChart
              width={460}
              height={300}
              data={cumulateBurn}
              margin={{
                bottom: 44,
                left: 0,
                top: 20,
              }}
            >
              <defs>
                <linearGradient id="Burn" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="10%" stopColor="#fcdb5b" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#f7e01e" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ffe95b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                axisLine={false}
                dataKey="blockTimestamp"
                domain={["dataMin", "dataMax"]}
                interval="preserveStartEnd"
                tickFormatter={convertUnixToDate}
                tick={CustomTick}
                tickCount={5}
                type="number"
                stroke="#000"
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={["auto", (dataMax: any) => dataMax * 2.5]} // ??
                interval="preserveStartEnd"
                tickFormatter={RawDataFormatter}
                tick={{ fontSize: 16 }}
                stroke="#000"
              />
              <CartesianGrid
                vertical={false}
                strokeDasharray="0 0"
                stroke="#f5f5f5"
              />
              <Area
                strokeWidth={3}
                type="stepAfter"
                dataKey="totalAmountBurned"
                stroke="#f7d509"
                fill="url(#Burn)"
                activeDot={{
                  r: 8,
                  strokeWidth: 3,
                  stroke: "#ffffff",
                  fill: "#000000",
                }}
              />
              <Tooltip
                content={<CustomTooltip formatter={RawNumberFormatter} />}
                cursor={{
                  stroke: "#000",
                  strokeWidth: 1,
                  strokeDasharray: "2 2",
                }}
                itemStyle={{ color: "#8884d8" }}
              />
            </AreaChart>
          </div>
          <div>
            <div
              className={`common-title`}
              style={{ marginBottom: "40px", textAlign: "center" }}
            >
              Distribution / Liquidity
            </div>
            <AreaChart
              width={460}
              height={300}
              data={cumulateTransfer}
              margin={{
                bottom: 44,
                left: 0,
                top: 20,
              }}
            >
              <defs>
                <linearGradient
                  id="distributionLiquidity"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="10%" stopColor="#ba00ff" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#d974ff" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#dc7fff" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                axisLine={false}
                dataKey="blockTimestamp"
                domain={["dataMin", "dataMax"]}
                interval="preserveStartEnd"
                tickFormatter={convertUnixToDate}
                tick={CustomTick}
                type="number"
                stroke="#000"
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={[0, (dataMax: number) => dataMax * 2]} // ??
                interval="preserveStartEnd"
                tickFormatter={RawDataFormatter}
                tick={{ fontSize: 16 }}
                stroke="#000"
              />
              <CartesianGrid
                vertical={false}
                strokeDasharray="0 0"
                stroke="#f5f5f5"
              />
              <Area
                strokeWidth={3}
                type="stepAfter"
                dataKey="totalAmountLiquidity"
                stroke="#ba00ff"
                fill="url(#distributionLiquidity)"
                activeDot={{
                  r: 8,
                  strokeWidth: 3,
                  stroke: "#ffffff",
                  fill: "#000000",
                }}
              />
              <Tooltip
                content={<CustomTooltip formatter={RawNumberFormatter} />}
                cursor={{
                  stroke: "#000",
                  strokeWidth: 1,
                  strokeDasharray: "2 2",
                }}
                itemStyle={{ color: "#8884d8" }}
              />
            </AreaChart>
          </div>
        </div>
      </div>
    );
  };

  const renderNarrowMainTable = () => {
    return (
      <div className="card mb-4 cardbody" style={{ minWidth: "300px" }}>
        <div className="card-body center">
          <table className="textWhiteSmaller">
            <thead>
              <tr>
                <th scope="col">Market Cap</th>
                <th scope="col">
                  Circulating Supply{" "}
                  <span className="">
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="left center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "3px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        Currently based on the total supply of purse token{" "}
                      </span>
                    </Popup>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  $
                  {(
                    parseFloat(formatUnits(purseTokenTotalSupply, "ether")) *
                    PURSEPrice
                  ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                <td>
                  {parseFloat(
                    formatUnits(purseTokenTotalSupply, "ether")
                  ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">
                  Burn (Total)
                  <span className="">
                    &nbsp;
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="bottom center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "1px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        (Unit in Token / unit in USD)
                      </span>
                    </Popup>
                  </span>
                </th>
                {/*<th scope="col">(Past 30 days&nbsp;Sum)</th>*/}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {parseFloat(
                    formatUnits(totalBurnAmount, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  / ${" "}
                  {(
                    parseFloat(formatUnits(totalBurnAmount, "ether")) *
                    PURSEPrice
                  ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                {/*<td>*/}
                {/*  {parseFloat(*/}
                {/*    formatUnits(sum30BurnAmount, "ether")*/}
                {/*  ).toLocaleString("en-US", {*/}
                {/*    maximumFractionDigits: 0,*/}
                {/*  })}{" "}*/}
                {/*  / ${" "}*/}
                {/*  {(*/}
                {/*    parseFloat(formatUnits(sum30BurnAmount, "ether")) **/}
                {/*    PURSEPrice*/}
                {/*  ).toLocaleString("en-US", {maximumFractionDigits: 0})}*/}
                {/*</td>*/}
              </tr>
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">
                  Distribution (Total)
                  <span className="">
                    &nbsp;
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="bottom center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "1px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        (Unit in Token / unit in USD)
                      </span>
                    </Popup>
                  </span>
                </th>
                {/*<th scope="col">(Past 30 days&nbsp;Sum)</th>*/}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {parseFloat(
                    formatUnits(totalTransferAmount, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  / ${" "}
                  {(
                    parseFloat(formatUnits(totalTransferAmount, "ether")) *
                    PURSEPrice
                  ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                {/*<td>*/}
                {/*  {parseFloat(*/}
                {/*    formatUnits(sum30TransferAmount, "ether")*/}
                {/*  ).toLocaleString("en-US", {*/}
                {/*    maximumFractionDigits: 0,*/}
                {/*  })}{" "}*/}
                {/*  / ${" "}*/}
                {/*  {(*/}
                {/*    parseFloat(formatUnits(sum30TransferAmount, "ether")) **/}
                {/*    PURSEPrice*/}
                {/*  ).toLocaleString("en-US", {maximumFractionDigits: 0})}*/}
                {/*</td>*/}
              </tr>
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">
                  Liquidity (Total)
                  <span className="">
                    &nbsp;
                    <Popup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1px" }}>
                          <BsFillQuestionCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="bottom center"
                      offsetY={-23}
                      offsetX={0}
                      contentStyle={{ padding: "1px" }}
                    >
                      <span className="textInfo">
                        {" "}
                        (Unit in Token / unit in USD){" "}
                      </span>
                    </Popup>
                  </span>
                </th>
                {/*<th scope="col">(Past 30 days&nbsp;Sum)</th>*/}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {parseFloat(
                    formatUnits(totalTransferAmount, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  / ${" "}
                  {(
                    parseFloat(formatUnits(totalTransferAmount, "ether")) *
                    PURSEPrice
                  ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </td>
                {/*<td>*/}
                {/*  {parseFloat(*/}
                {/*    formatUnits(sum30TransferAmount, "ether")*/}
                {/*  ).toLocaleString("en-US", {*/}
                {/*    maximumFractionDigits: 0,*/}
                {/*  })}{" "}*/}
                {/*  / ${" "}*/}
                {/*  {(*/}
                {/*    parseFloat(formatUnits(sum30TransferAmount, "ether")) **/}
                {/*    PURSEPrice*/}
                {/*  ).toLocaleString("en-US", {maximumFractionDigits: 0})}*/}
                {/*</td>*/}
              </tr>
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">PURSE Token Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  $
                  {parseFloat(PURSEPrice.toString()).toLocaleString("en-US", {
                    maximumFractionDigits: 6,
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderNarrowFarmTable = () => {
    return (
      <div className="card mb-2 cardbody" style={{ minWidth: "300px" }}>
        <div className="card-body center">
          <table className="textWhiteSmaller text-center">
            <thead>
              <tr>
                <th scope="col">Total Pool</th>
                <th scope="col">Farm's PURSE Reward</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{poolLength}</td>
                <td>
                  {parseFloat(
                    formatBigNumber(totalRewardPerBlock, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  Purse per block
                </td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">PURSE Token Total Supply</th>
                <th scope="col">Farm's Cap Reward Token</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {parseFloat(
                    formatBigNumber(purseTokenTotalSupply, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  Purse
                </td>
                <td>
                  {parseFloat(
                    formatBigNumber(poolCapRewardToken, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  Purse
                </td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th scope="col">Farm's Minted Reward Token</th>
                <th scope="col">Farm's PURSE Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {parseFloat(
                    formatBigNumber(poolMintedRewardToken, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  Purse
                </td>
                <td>
                  {parseFloat(
                    formatBigNumber(poolRewardToken, "ether")
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  Purse
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderNarrowTable = () => {
    return (
      <>
        <div style={{ display: selectedTab === "main" ? "block" : "none" }}>
          {renderNarrowMainTable()}
        </div>
        <div style={{ display: selectedTab === "farm" ? "block" : "none" }}>
          {renderNarrowFarmTable()}
        </div>
        {/* <div style={{display: selectedTab === "vault" ? "block" : "none"}}>
            {renderNarrowVaultTable()}
          </div> */}
      </>
    );
  };

  const renderNarrowCharts = () => {
    return (
      <div
        className="container pt-4"
        style={{
          display: selectedTab === "main" ? "block" : "none",
          width: "fit-content",
        }}
      >
        <label
          className="textWhite center mb-2 pt-4"
          style={{ fontSize: "40px", textAlign: "center" }}
        >
          <big>
            <b>CHARTS</b>
          </big>
        </label>
        <div className="row center">
          {cumulateBurn ? (
            // <div>
            //   <AreaChart width={290} height={250} data={cumulateBurn}>
            //     <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
            //     <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
            //     <CartesianGrid vertical={false} strokeDasharray="2 2" />
            //     <Tooltip formatter={NumberFormater} />
            //     <Legend verticalAlign="top" height={50} formatter={() => ("Burn")} wrapperStyle={{fontSize: "20px"}}/>
            //     <Area type="monotone" dataKey="Sum" stroke="#8884d8" fillOpacity={0.5} fill="#8884d8" />
            //   </AreaChart><li style={{color:'transparent'}}/>
            // </div>
            <div>
              <div
                className={`common-title`}
                style={{ marginBottom: "40px", textAlign: "center" }}
              >
                Burn
              </div>
              <AreaChart
                width={290}
                height={250}
                data={cumulateBurn}
                margin={{
                  bottom: 44,
                  left: 0,
                  top: 20,
                }}
              >
                <defs>
                  <linearGradient id="Burn" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="10%" stopColor="#fcdb5b" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#f7e01e" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#ffe95b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  axisLine={false}
                  dataKey="blockTimestamp"
                  tick={CustomTick}
                  tickFormatter={convertUnixToDate}
                  stroke="#000"
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  dataKey="totalAmountBurned"
                  domain={[0, (dataMax: number) => dataMax * 1.2]}
                  interval="preserveStartEnd"
                  tickFormatter={RawDataFormatter}
                  tick={{ fontSize: 16 }}
                  stroke="#000"
                />
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="0 0"
                  stroke="#f5f5f5"
                />
                <Area
                  strokeWidth={3}
                  type="monotone"
                  dataKey="totalAmountBurned"
                  stroke="#f7d509"
                  fill="url(#Burn)"
                  activeDot={{
                    r: 8,
                    strokeWidth: 3,
                    stroke: "#ffffff",
                    fill: "#000000",
                  }}
                />
                <Tooltip
                  content={<CustomTooltip formatter={RawNumberFormatter} />}
                  cursor={{
                    stroke: "#000",
                    strokeWidth: 1,
                    strokeDasharray: "2 2",
                  }}
                  itemStyle={{ color: "#8884d8" }}
                />
              </AreaChart>
            </div>
          ) : (
            <div></div>
          )}
          {/* <div>  
    <AreaChart width={290} height={250} data={cumulateTransfer}>
      <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
      <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
      <CartesianGrid vertical={false} strokeDasharray="2 2" />
      <Tooltip formatter={NumberFormater} />
      <Legend verticalAlign="top" height={50} formatter={() => ("Distribution / Liquidity")} wrapperStyle={{fontSize: "20px"}}/>
      <Area type="monotone" dataKey="Sum" stroke="#82ca9d" fillOpacity={0.5} fill="#82ca9d" />
    </AreaChart><li style={{color:'transparent'}}/>
  </div> */}
          <div>
            <div
              className={`common-title`}
              style={{ marginBottom: "40px", textAlign: "center" }}
            >
              Distribution / Liquidity
            </div>
            <AreaChart
              width={290}
              height={250}
              margin={{
                bottom: 44,
                left: 0,
                top: 20,
              }}
              data={cumulateTransfer}
            >
              <defs>
                <linearGradient
                  id="distributionLiquidity"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="10%" stopColor="#ba00ff" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#d974ff" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#dc7fff" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                axisLine={false}
                dataKey="blockTimestamp"
                tick={CustomTick}
                tickFormatter={convertUnixToDate}
                stroke="#000"
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={[0, (dataMax: number) => dataMax * 1.2]}
                interval="preserveStartEnd"
                tickFormatter={RawDataFormatter}
                tick={{ fontSize: 16 }}
                scale="linear"
                stroke="#000"
              />
              <CartesianGrid
                vertical={false}
                strokeDasharray="0 0"
                stroke="#f5f5f5"
              />
              <Area
                strokeWidth={3}
                type="monotone"
                dataKey="totalAmountLiquidity"
                stroke="#ba00ff"
                fill="url(#distributionLiquidity)"
                activeDot={{
                  r: 8,
                  strokeWidth: 3,
                  stroke: "#ffffff",
                  fill: "#000000",
                }}
              />
              <Tooltip
                content={<CustomTooltip formatter={RawNumberFormatter} />}
                cursor={{
                  stroke: "#000",
                  strokeWidth: 1,
                  strokeDasharray: "2 2",
                }}
                itemStyle={{ color: "#8884d8" }}
              />
            </AreaChart>
          </div>
        </div>
      </div>
    );
  };

  const renderFarmRemarks = () => {
    return (
      <div
        style={{
          display: selectedTab === "farm" ? "block" : "none",
          margin: "60px 0 140px 0",
        }}
      >
        <div
          className="text mt-2 common-title"
          style={{ color: "#000", fontSize: "14px" }}
        >
          &nbsp;Remarks :
        </div>
        <br />
        <div
          className="rowC ml-2 mt-2"
          style={{ color: "#000", fontSize: "12px" }}
        >
          &nbsp;
          <div>
            <IoStar className="mb-1" />
            &nbsp;&nbsp;
          </div>
          <div>
            Farm Cap Reward Token: Total capacity reward tokens will be minted
            by this farm.
          </div>
        </div>
        <div
          className="rowC ml-2 mt-1"
          style={{ color: "#000", fontSize: "12px" }}
        >
          &nbsp;
          <div>
            <IoStar className="mb-1" />
            &nbsp;&nbsp;
          </div>
          <div>
            Farm Minted Reward Token: Total reward tokens minted by this farm
            until now.
          </div>
        </div>
        <div
          className="rowC ml-2 mt-1"
          style={{ color: "#000", fontSize: "12px" }}
        >
          &nbsp;
          <div>
            <IoStar className="mb-1" />
            &nbsp;&nbsp;
          </div>
          <div>
            Farm's Reward Token: Total reward tokens inside this farm (smart
            contract).
          </div>
        </div>
      </div>
    );
  };

  const renderProtocolRemarks = () => {
    return (
      <>
        <label
          className="textWhite center mb-2 pt-4"
          style={{ fontSize: "40px", textAlign: "center" }}
        >
          <big>
            <b>PROTOCOLS</b>
          </big>
        </label>
        <Bounce direction="left" triggerOnce>
          <div
            className="mt-2"
            style={{
              minWidth: "300px",
              padding: "15px",
              backgroundColor: "var(--basic-ash)",
            }}
          >
            <div className="textWhiteSmall">
              <b>LP Restaking Farm</b>
            </div>
            <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
              <b>
                Providing liquidity on respective platform to receive LP Tokens
                and earn PURSE by staking the LP Tokens in the LP Restaking
                Farm.
              </b>
            </div>
          </div>
        </Bounce>
        <Bounce direction="left" triggerOnce>
          <div
            className="mt-2"
            style={{
              minWidth: "300px",
              padding: "15px",
              backgroundColor: "var(--basic-ash)",
            }}
          >
            <div className="textWhiteSmall">
              <b>PURSE Staking</b>
            </div>
            <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
              <b>Stake PURSE and amplify your earnings with PURSE Staking.</b>
            </div>
          </div>
        </Bounce>
        <Bounce direction="left" triggerOnce>
          <div
            className="mt-2"
            style={{
              minWidth: "300px",
              padding: "15px",
              backgroundColor: "var(--basic-ash)",
            }}
          >
            <div className="textWhiteSmall">
              <b>PURSE BOX</b>
            </div>
            <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
              <b>PURSE adopts the experimental ERC404 dual-natured token.</b>
            </div>
          </div>
        </Bounce>
      </>
    );
  };

  return (
    <div
      id="content"
      className="mt-4"
      style={{ margin: "0 auto", maxWidth: "1000px" }}
    >
      <label
        className="textWhite center mb-2"
        style={{ fontSize: "40px", textAlign: "center" }}
      >
        <big>
          <b>DASHBOARD</b>
        </big>
      </label>
      <div
        style={{
          backgroundColor: "#efefef",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "row",
          margin: "15px auto",
          padding: "2px",
          width: "160px",
        }}
      >
        <button
          type="button"
          style={{
            backgroundColor: selectedTab === "main" ? "#d461ff" : "",
            borderWidth: 0,
            borderRadius: "12px",
            color: selectedTab === "main" ? "#fff" : "#000",
            padding: "5px 3px",
            width: "100%",
          }}
          onClick={() => setSelectedTab("main")}
        >
          TOKEN
        </button>
        <button
          type="button"
          style={{
            backgroundColor: selectedTab === "farm" ? "#d461ff" : "",
            borderWidth: 0,
            borderRadius: "12px",
            color: selectedTab === "farm" ? "#fff" : "#000",
            padding: "5px 3px",
            width: "100%",
          }}
          onClick={() => setSelectedTab("farm")}
        >
          FARM
        </button>
        {/* <button onClick={() => setSelectedTab("vault")}>VAULT</button> */}
      </div>

      <MediaQuery minWidth={601}>
        {renderFullTable()}
        {renderProtocolRemarks()}
        {renderFullCharts()}
      </MediaQuery>
      <MediaQuery maxWidth={600}>
        {renderNarrowTable()}
        {renderProtocolRemarks()}
        {renderNarrowCharts()}
      </MediaQuery>
      {renderFarmRemarks()}
    </div>
  );
}
