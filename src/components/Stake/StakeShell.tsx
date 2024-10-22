import React, { ReactNode, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import MediaQuery from "react-responsive";
import { Popup as ReactPopup } from "reactjs-popup";
import { BsFillQuestionCircleFill, BsArrowRight } from "react-icons/bs";
import { AiFillAlert } from "react-icons/ai";
import {
  convertUnixToDate,
  convertUnixToDateTime,
  formatBigNumber,
  FormatNumberToString,
  RawDataFormatter,
  RawNumberFormatter,
} from "../utils";

import "../App.css";
import { useWeb3React } from "@web3-react/core";
import { Loading } from "../Loading";
import { BigNumber } from "ethers";
import { TVLData } from "./types";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "../CustomTooltip";

type StakeShellProps = {
  claimVesting: () => void;
  onClickHandlerDeposit: (amount: string) => Promise<boolean>;
  onClickHandlerWithdraw: (amount: string) => Promise<boolean>;
  claimVestingLoading: boolean;
  isTargetChainMatch: boolean;
  maxStake: BigNumber;
  maxUnstake: BigNumber;
  purseStakingEndTime: number;
  stakeInfo: ReactNode;
  stakeLoading: boolean;
  vestingData: any[];
  TVLData?: TVLData[];
};

export default function StakeShell(props: StakeShellProps) {
  const {
    claimVesting,
    onClickHandlerDeposit,
    onClickHandlerWithdraw,
    claimVestingLoading,
    isTargetChainMatch,
    maxStake,
    maxUnstake,
    purseStakingEndTime,
    stakeInfo,
    stakeLoading,
    vestingData,
    TVLData,
  } = props;

  const { isActive } = useWeb3React();

  const [mode, setMode] = useState("Stake");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const [valid, setValid] = useState(false);

  const onChangeHandler = (event: string) => {
    setAmount(event);
    const amountRegex = /^\d+(\.\d{1,18})?$/;
    let result = amountRegex.test(event);
    if (!result) {
      setMessage("Not a valid number");
    } else {
      setMessage("");
    }
    setValid(result);
    if (parseFloat(event) <= 0) {
      setMessage("Value needs to be greater than 0");
      setValid(false);
    }
  };

  const getISOStringWithoutSecsAndMillisecs2 = (x: any) => {
    var now = new Date(x);
    now.setSeconds(0, 0);
    var stamp = now.toString().substring(3, 21);

    return stamp;
  };

  const renderInfoBanner = () => {
    return (
      <div
        className="mb-4"
        style={{ backgroundColor: "#ba00ff", padding: "20px 40px" }}
      >
        <div className="rowC textWhiteSmaller ml-2 mb-2">
          <div className="ml-2" style={{ color: "#fff" }}>
            <b>
              Maximize your rewards with PURSE Staking. The more you stake, the
              more you earn, claimable any time without interruptions to your
              continuous earning potential.
            </b>
          </div>
        </div>
        <div
          className="rowC textWhiteSmaller ml-2 mb-2"
          style={{ color: "#fff" }}
        >
          <a
            href="https://pundi.gitbook.io/pundi/readme/purse-docs/protocols/purse-staking-rewards"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div className="ml-2 ex-link">
              <b>
                Learn how staked PURSE amplify your earnings{" "}
                <BsArrowRight size="16" />
              </b>
            </div>
          </a>
        </div>
      </div>
    );
  };

  const renderUserActionContainer = () => {
    return (
      <div style={{ marginLeft: "8px" }}>
        <div
          style={{
            border: "#e0dede inset 2px",
            borderRadius: "8px",
            padding: "12px 8px",
          }}
        >
          <ButtonGroup style={{ width: "100%" }}>
            <Button
              type="button"
              variant="ghost"
              style={{
                backgroundColor: mode === "Stake" ? "#ba00ff" : "",
                color: mode === "Stake" ? "#fff" : "#000",
                width: "100%",
                padding: "8px 0",
              }}
              onClick={(event) => {
                setMode("Stake");
              }}
            >
              Stake&nbsp;&nbsp;
              <ReactPopup
                trigger={(open) => (
                  <span
                    style={{
                      position: "relative",
                      top: "-1.5px",
                      color: mode === "Stake" ? "#fff" : "#000",
                    }}
                  >
                    <BsFillQuestionCircleFill size={14} />
                  </span>
                )}
                on="hover"
                position="right center"
                offsetY={-23}
                offsetX={0}
                contentStyle={{ padding: "3px" }}
              >
                <span className="textInfo">
                  {" "}
                  Stake your PURSE to earn auto-compounding PURSE rewards over
                  time
                </span>
              </ReactPopup>
            </Button>

            <Button
              type="button"
              variant="ghost"
              style={{
                backgroundColor: mode === "Unstake" ? "#ba00ff" : "",
                color: mode === "Unstake" ? "#fff" : "#000",
                width: "100%",
                padding: "8px 0",
              }}
              onClick={(event) => {
                setMode("Unstake");
              }}
            >
              Unstake&nbsp;&nbsp;
              <ReactPopup
                trigger={(open) => (
                  <span
                    style={{
                      position: "relative",
                      top: "-1.5px",
                      color: mode === "Unstake" ? "#fff" : "#000",
                    }}
                  >
                    <BsFillQuestionCircleFill size={14} />
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
                  Unstake and earn PURSE rewards using your shares
                </span>
              </ReactPopup>
            </Button>
          </ButtonGroup>
          <div className="center mt-4">
            <div className="input-group mb-0" style={{ width: "95%" }}>
              <input
                type="text"
                onPaste={(event) => {
                  event.preventDefault();
                }}
                className="form-control cardbody mr-1"
                placeholder="0"
                onChange={(e) => {
                  const value = e.target.value;
                  onChangeHandler(value);
                }}
                value={amount}
                disabled={stakeLoading}
                required
              />
              <div
                className="input-group-append center"
                style={{ color: "#000", width: "80px" }}
              >
                {mode === "Stake" ? "PURSE" : "Shares"}{" "}
              </div>
            </div>
          </div>
          <div className="ml-4" style={{ color: "#DC143C" }}>
            {message}{" "}
          </div>

          <div className="center mt-3">
            <ButtonGroup style={{ width: "70%" }}>
              <Button
                type="submit"
                disabled={stakeLoading}
                onClick={async (event) => {
                  if (!valid) {
                    return;
                  }
                  let success = false;
                  if (mode === "Stake") {
                    success = await onClickHandlerDeposit(amount);
                  } else if (mode === "Unstake") {
                    success = await onClickHandlerWithdraw(amount);
                  }
                  if (success) setAmount("");
                }}
              >
                {stakeLoading ? <Loading /> : mode}
              </Button>

              <Button
                type="button"
                variant="outline-primary"
                disabled={stakeLoading}
                onClick={(event) => {
                  if (mode === "Stake") {
                    onChangeHandler(formatBigNumber(maxStake, "ether"));
                  } else if (mode === "Unstake") {
                    onChangeHandler(formatBigNumber(maxUnstake, "ether"));
                  }
                }}
              >
                Max
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div>
          <div className="center textWhite mt-3 mb-3">
            <div
              style={{
                width: "90%",
                textAlign: "center",
                fontSize: "12px",
                backgroundColor: "rgb(186 0 255 / 38%)",
                padding: "8px",
              }}
            >
              <AiFillAlert className="mb-1" />
              &nbsp;Notice: The withdrawal's lock mechanism has been revised.
              The lock period for pending request will no longer reset back to
              21 days with a new unstaking entry. For more information, please
              consult the documentation.
            </div>
          </div>

          <div
            className="mb-2"
            style={{
              padding: "5px",
              width: "90%",
              margin: "0 auto",
              minWidth: "210px",
            }}
          >
            <div className="row center" style={{ fontWeight: "900" }}>
              <div
                className="mb-1 mt-1"
                style={{
                  backgroundColor: "#ba00ff",
                  color: "white",
                  margin: "0 auto",
                  padding: "4px 0",
                  width: "90%",
                  textAlign: "center",
                  fontSize: "16px",
                }}
              >
                Pending Withdrawal Requests
              </div>
            </div>

            <div
              className="row center mb-1"
              style={{
                fontWeight: "bold",
                justifyContent: "space-between",
                margin: "0 auto",
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  padding: "0 10px",
                  textAlign: "left",
                  width: "35%",
                }}
              >
                Amount (PURSE)
              </div>
              <div
                style={{
                  fontSize: "15px",
                  padding: "0 10px",
                  textAlign: "left",
                  width: "40%",
                }}
              >
                Completion Time
              </div>
              <div
                style={{
                  fontSize: "15px",
                  padding: "0 10px",
                  textAlign: "right",
                  width: "25%",
                }}
              >
                Status
              </div>
            </div>

            {vestingData.map((vestingData: any) => {
              return (
                <div
                  className="row center"
                  style={{
                    justifyContent: "space-between",
                    margin: "0 auto",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "35%",
                      textAlign: "left",
                      fontSize: "14px",
                      padding: "0 10px",
                    }}
                  >
                    {FormatNumberToString({
                      bigNum: vestingData.quantity,
                      decimalPlaces: 5,
                    })}
                  </div>
                  <div
                    style={{
                      width: "40%",
                      textAlign: "left",
                      fontSize: "14px",
                      padding: "0 10px",
                    }}
                  >
                    {getISOStringWithoutSecsAndMillisecs2(
                      vestingData.endTime * 1000
                    )}
                  </div>
                  <div
                    style={{
                      width: "25%",
                      textAlign: "right",
                      fontSize: "14px",
                      padding: "0 10px",
                    }}
                  >
                    {vestingData.endTime > (Date.now() / 1000).toFixed(0) ? (
                      <div>Not ready</div>
                    ) : (
                      <div>
                        {vestingData.vestedQuantity.gt(vestingData.quantity) ? (
                          <div>Redeemed</div>
                        ) : (
                          <div>Available</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="row center">
              <Button
                type="button"
                className="btn btn-sm mt-3 mb-3"
                style={{ width: "100px" }}
                disabled={
                  claimVestingLoading ||
                  ((purseStakingEndTime === 0 ||
                    purseStakingEndTime > Date.now() / 1000) &&
                    !!!vestingData?.reduce(
                      (flag: number, curr: any) =>
                        flag + +(Date.now() / 1000 > curr.endTime),
                      0
                    ))
                }
                onClick={(event) => {
                  claimVesting();
                }}
              >
                Claim
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWideUserActionContainer = () => {
    return (
      <div
        style={{
          marginLeft: "0 1vw 0 2vw",
          minWidth: "300px",
          width: "40%",
        }}
      >
        {renderUserActionContainer()}
      </div>
    );
  };

  return (
    <>
      <MediaQuery minWidth={601}>
        <>
          <div
            className="card cardbody"
            style={{
              margin: "0 auto",
              padding: "24px",
              width: "70%",
              minWidth: "750px",
            }}
          >
            {renderInfoBanner()}
            <div style={{ padding: "0 5px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <div style={{ minWidth: "330px", width: "65%" }}>
                  {stakeInfo}
                </div>
                {isActive && isTargetChainMatch
                  ? renderWideUserActionContainer()
                  : null}
              </div>
            </div>
          </div>
          {TVLData ? (
            <div
              style={{
                margin: "0 auto",
                padding: "24px",
                width: "70%",
                minWidth: "750px",
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={TVLData} margin={{ top: 10 }}>
                  <XAxis
                    dataKey="blockTimestamp"
                    domain={["dataMin", "dataMax"]}
                    interval="preserveStartEnd"
                    type="number"
                    tickFormatter={(value) =>
                      convertUnixToDateTime(value, false)
                    }
                    stroke="#000"
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[0, (dataMax: number) => dataMax * 11]} // ??
                    interval="preserveStartEnd"
                    tickFormatter={RawDataFormatter}
                    tick={{ fontSize: 12 }}
                    stroke="#000"
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
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="totalAmountLiquidity"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </>
      </MediaQuery>
      <MediaQuery maxWidth={600}>
        <div className="card cardbody" style={{ padding: "16px" }}>
          {renderInfoBanner()}
          {stakeInfo}
          <hr style={{ marginBottom: "24px" }} />
          {isActive && isTargetChainMatch ? renderUserActionContainer() : null}
          {TVLData ? (
            <div
              style={{
                margin: "0 auto",
                width: "100%",
              }}
            >
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={TVLData} margin={{ top: 10 }}>
                  <XAxis
                    dataKey="blockTimestamp"
                    domain={["dataMin", "dataMax"]}
                    interval="preserveStartEnd"
                    type="number"
                    tickFormatter={convertUnixToDate}
                    stroke="#000"
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[0, (dataMax: number) => dataMax * 11]} // ??
                    interval="preserveStartEnd"
                    tickFormatter={RawDataFormatter}
                    tick={{ fontSize: 12 }}
                    stroke="#000"
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
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="totalAmountLiquidity"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      </MediaQuery>
    </>
  );
}
