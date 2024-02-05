import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import MediaQuery from "react-responsive";
import {
  AreaChart,
  Area,
  YAxis,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import * as Constants from "../../constants";
import { Loading } from "../Loading";
import { usePursePrice } from "../state/PursePrice/hooks";
import { useContract } from "../state/contract/hooks";
import { DataFormater, NumberFormater } from "../utils";

interface CustomTooltipProps {
  payload?: any[];
  label?: string;
}

export default function TokenDashboard() {
  const [PURSEPrice] = usePursePrice();
  const { purseTokenUpgradable } = useContract();

  const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(
    BigNumber.from("0")
  );
  // PURSE DASHBOARD STATES
  const [totalBurnAmount, setTotalBurnAmount] = useState("0");
  const [sum30BurnAmount, setSum30BurnAmount] = useState("0");
  const [totalTransferAmount, setTotalTransferAmount] = useState("0");
  const [cumulateTransfer, setCumulateTransfer] = useState<
    { Sum: number; Date: string }[]
  >([]);
  const [cumulateBurn, setCumulateBurn] = useState<
    { Sum: number; Date: string }[]
  >([]);

  const [isFetchMainDataLoading, setIsFetchMainDataLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        purseTokenUpgradable
          ._totalSupply()
          .then((res: BigNumber) => setPurseTokenTotalSupply(res)),
        fetch(Constants.MONGO_RESPONSE_0_API).then((resp) => {
          resp.json().then((json) => {
            setTotalTransferAmount(json["TransferTotal"][0]);
            setTotalBurnAmount(json["BurnTotal"][0]);
            setSum30BurnAmount(json["Burn30Days"][0]);
          });
        }),
        fetch(Constants.MONGO_RESPONSE_1_API).then((resp) => {
          resp.json().then((json) => {
            const _cumulateTransfer: { Sum: number; Date: string }[] = [];
            json.forEach((item: { Sum: string; Date: string }) =>
              _cumulateTransfer.push({
                Sum: parseFloat(item.Sum),
                Date: item.Date,
              })
            );
            setCumulateTransfer(_cumulateTransfer);
          });
        }),
        fetch(Constants.MONGO_RESPONSE_2_API).then((resp) => {
          resp.json().then((json) => {
            const _cumulateBurn: { Sum: number; Date: string }[] = [];
            json.forEach((item: { Sum: string; Date: string }) =>
              _cumulateBurn.push({ Sum: parseFloat(item.Sum), Date: item.Date })
            );
            setCumulateBurn(_cumulateBurn);
          });
        }),
      ]).then(() => {
        setIsFetchMainDataLoading(false);
      });
    }
    loadData();
  }, [purseTokenUpgradable]);

  const CustomTick = (propsCustomTick: any) => {
    const { x, y, payload } = propsCustomTick;
    const date = new Date(payload.value);
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

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload, label }) => {
    if (payload && payload.length) {
      const value = parseFloat(payload[0].value);
      const date = new Date(label as any);
      const year = date.getFullYear();
      const month = date.toLocaleString("en-US", { month: "long" });
      const day = date.getDate();
      const formattedValue = value.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      });

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
          </table>
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
              {isFetchMainDataLoading ? (
                <tr>
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

  return (
    <>
      <MediaQuery minWidth={601}>{renderFullMainTable()}</MediaQuery>
      <MediaQuery maxWidth={600}>{renderNarrowMainTable()}</MediaQuery>
    </>
  );
}
