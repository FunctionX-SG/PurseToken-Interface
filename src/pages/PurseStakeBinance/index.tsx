import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { Popup as ReactPopup } from "reactjs-popup";
import { BsInfoCircleFill } from "react-icons/bs";
import { RiArrowRightFill } from "react-icons/ri";
import * as Constants from "../../constants";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import {
  fetcher,
  callContract,
  formatBigNumber,
  getShortTxHash,
  formatShortenAddress,
  FormatNumberToString,
  RawDataFormatter,
  RawNumberFormatter,
} from "../../components/utils";

import "../../components/App.css";
import { useWeb3React } from "@web3-react/core";
import { Loading } from "../../components/Loading";
import useSWR from "swr";
import { useToast } from "../../components/state/toast/hooks";
import { useProvider } from "../../components/state/provider/hooks";
import { usePursePrice } from "../../components/state/PursePrice/hooks";
import { useContract } from "../../components/state/contract/hooks";
import { useWalletTrigger } from "../../components/state/walletTrigger/hooks";
import { useNetwork } from "../../components/state/network/hooks";
import StakeShell from "../../components/Stake/StakeShell";
import { TVLData } from "../../components/TvlChart/types";
import TVLChart from "../../components/TvlChart";

export default function PurseStakeBinance() {
  const { isActive, chainId, account } = useWeb3React();
  const targetChain = 56; //change to 56 for bsc mainnet, 97 for bsc testnet
  const isTargetChainMatch = chainId === targetChain;
  const [, switchNetwork] = useNetwork();
  const [PURSEPrice] = usePursePrice();
  const { signer } = useProvider();
  const [, showToast] = useToast();

  const {
    purseStaking,
    purseStakingVesting,
    purseTokenUpgradable,
    treasuryContract,
    rewardDistributor,
  } = useContract();

  const [purseStakingUserReceipt, setPurseStakingUserReceipt] =
    useState<BigNumber>(BigNumber.from("0"));
  const [purseStakingUserNewReceipt, setPurseStakingUserNewReceipt] =
    useState<BigNumber>(BigNumber.from("0"));
  const [purseStakingUserWithdrawReward, setPurseStakingUserWithdrawReward] =
    useState(0);
  const [purseStakingVestingData, setPurseStakingVestingData] = useState<any[]>(
    []
  );
  const [purseStakingEndTime, setPurseStakingEndTime] = useState(0);
  const [purseStakingLockPeriod, setPurseStakingLockPeriod] = useState(0);
  const [purseAmountUnlock, setPurseAmountUnlock] = useState(0);
  const [purseAmountLock, setPurseAmountLock] = useState(0);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimVestingLoading, setClaimVestingLoading] = useState(false);
  const [, setTrigger] = useWalletTrigger();
  const [stakingTVLData, setStakingTVLData] = useState<TVLData[]>();
  const [isLoading, setIsLoading] = useState(true);

  const { data: purseStakingTotalStake } = useSWR(
    {
      contract: "purseStaking",
      method: "availablePurseSupply",
      params: [],
    },
    {
      fetcher: fetcher(purseStaking),
      refreshInterval: 5000,
    }
  );

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

  const { data: purseStakingUserAllowance } = useSWR(
    {
      contract: "purseTokenUpgradable",
      method: "allowance",
      params: [account, Constants.PURSE_STAKING_ADDRESS],
    },
    {
      fetcher: fetcher(purseTokenUpgradable),
      refreshInterval: 5000,
    }
  );

  const { data: purseStakingTotalReceipt } = useSWR(
    {
      contract: "purseStaking",
      method: "totalReceiptSupply",
      params: [],
    },
    {
      fetcher: fetcher(purseStaking),
      refreshInterval: 5000,
    }
  );

  const { data: purseStakingUserStake } = useSWR(
    {
      contract: "purseStaking",
      method: "getTotalPurse",
      params: [account],
    },
    {
      fetcher: fetcher(purseStaking),
      refreshInterval: 5000,
    }
  );

  const { data: purseStakingUserInfo } = useSWR(
    {
      contract: "purseStaking",
      method: "userInfo",
      params: [account],
    },
    {
      fetcher: fetcher(purseStaking),
      refreshInterval: 5000,
    }
  );

  const { data: purseStakingReward } = useSWR(
    {
      contract: "purseStaking",
      method: "previewClaimableRewards",
      params: [account],
    },
    {
      fetcher: fetcher(purseStaking),
      refreshInterval: 5000,
    }
  );

  const { data: tokensPerInterval } = useSWR(
    {
      contract: "rewardDistributor",
      method: "tokensPerInterval",
      params: [],
    },
    {
      fetcher: fetcher(rewardDistributor),
      refreshInterval: 5000,
    }
  );

  const reloadVestingTable = () => {
    purseStakingVesting
      .getVestingSchedules(account)
      .then((resp: any[]) => setPurseStakingVestingData(resp));
  };

  useEffect(() => {
    if (purseStakingUserInfo) {
      let _purseStakingUserReceipt = purseStakingUserInfo[0];
      setPurseStakingUserReceipt(_purseStakingUserReceipt);

      let _purseStakingUserNewReceipt = purseStakingUserInfo[1];

      setPurseStakingUserNewReceipt(_purseStakingUserNewReceipt);

      let _purseStakingUserWithdrawReward = purseStakingUserInfo[2];
      setPurseStakingUserWithdrawReward(
        parseFloat(formatUnits(_purseStakingUserWithdrawReward, "ether"))
      );

      purseStakingVesting
        .getVestingSchedules(account)
        .then((resp: any[]) => setPurseStakingVestingData(resp));

      let _purseStakingUserLockTime = parseFloat(
        purseStakingUserInfo[3].toString()
      );
      setPurseStakingEndTime(
        _purseStakingUserLockTime > 0
          ? _purseStakingUserLockTime + purseStakingLockPeriod
          : 0
      );
    }
  }, [
    purseStakingUserInfo,
    purseStakingLockPeriod,
    purseStakingVesting,
    account,
  ]);

  useEffect(() => {
    async function loadData() {
      Promise.all([
        purseStaking
          .lockPeriod()
          .then((resp: any) =>
            setPurseStakingLockPeriod(parseFloat(resp.toString()))
          ),
        checkPurseAmount(purseStakingUserReceipt).then((amount) => {
          setPurseAmountUnlock(parseFloat(amount[3]));
        }),
        checkPurseAmount(purseStakingUserNewReceipt).then((amount) => {
          setPurseAmountLock(parseFloat(amount[2]));
        }),
        fetchStakeTvl(),
      ]).then(() => setIsLoading(false));
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    account,
    purseStaking,
    purseStakingUserReceipt,
    purseStakingUserNewReceipt,
  ]);

  const onClickHandlerDeposit = async (amount: string) => {
    let amountWei = parseUnits(amount, "ether");
    if (amountWei.gt(purseTokenUpgradableBalance)) {
      showToast("Insufficient PURSE to stake!", "failure");
      return false;
    } else {
      return await stake(amountWei);
    }
  };

  const onClickHandlerWithdraw = async (amount: string) => {
    let receiptWei = parseUnits(amount, "ether");
    if (receiptWei.gt(purseStakingUserTotalReceipt)) {
      showToast("Insufficient Shares to unstake!", "failure");
      return false;
    } else {
      return await unstake(receiptWei);
    }
  };

  const handleTxResponse = async (
    promise: Promise<any>,
    refresh?: () => void
  ) => {
    try {
      const tx = await promise;
      if (tx?.hash) {
        const link = `https://bscscan.com/tx/${tx.hash}`;
        showToast("Transaction sent!", "success", link);
        await tx.wait();
        if (refresh !== undefined) {
          refresh();
        }
        const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
          tx.hash
        )}`;
        showToast(message, "success", link);
        setStakeLoading(false);
        return true;
      } else if (tx?.message.includes("user rejected transaction")) {
        showToast(`User rejected transaction.`, "failure");
      } else if (tx?.reason) {
        showToast(`Execution reverted: ${tx.reason}`, "failure");
      } else {
        showToast("Something went wrong.", "failure");
      }
    } catch (err) {
      showToast("Something went wrong.", "failure");
      console.log(err);
      return false;
    }
    return false;
  };

  const stake = async (amount: BigNumber) => {
    if (!isActive) {
      return false;
    }
    if (amount.gt(purseStakingUserAllowance)) {
      await approvePurse();
    }
    setStakeLoading(true);
    const success = await handleTxResponse(
      callContract(signer, purseStaking, "enter", amount)
    );
    setStakeLoading(false);
    return success;
  };

  const unstake = async (receipt: BigNumber) => {
    if (!isActive) {
      return false;
    }
    setStakeLoading(true);
    const success = await handleTxResponse(
      callContract(signer, purseStaking, "leave", receipt),
      reloadVestingTable
    );
    setStakeLoading(false);
    return success;
  };

  const approvePurse = async () => {
    if (!isActive) {
      return false;
    }
    return await handleTxResponse(
      callContract(
        signer,
        purseTokenUpgradable,
        "approve",
        Constants.PURSE_STAKING_ADDRESS,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      )
    );
  };

  const claim = async () => {
    if (!isActive) {
      return false;
    }
    setClaimLoading(true);
    const success = await handleTxResponse(
      callContract(signer, treasuryContract, "claimRewards", account)
    );
    setClaimLoading(false);
    return success;
  };

  const claimVesting = async () => {
    if (!isActive) {
      return false;
    }
    setClaimVestingLoading(true);
    let promise: Promise<any>;
    if (
      purseStakingUserWithdrawReward > 0 &&
      purseStakingEndTime < Date.now() / 1000
    ) {
      promise = callContract(signer, purseStaking, "withdrawLockedAmount");
    } else {
      promise = callContract(
        signer,
        purseStakingVesting,
        "vestCompletedSchedules"
      );
    }
    const success = await handleTxResponse(promise);
    setClaimVestingLoading(false);
    return success;
  };

  const fetchStakeTvl = async () => {
    const res = await fetch(Constants.SUBGRAPH_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          {
            stakingTVLUpdates(first: 1000, orderBy: blockTimestamp) {
              blockTimestamp
              totalAmountLiquidity
              totalLiquidityValueUSD
            }
          }
        `,
      }),
    });
    const json = await res.json();
    const tvl: TVLData[] = json.data.stakingTVLUpdates;
    setStakingTVLData(tvl);
  };

  const checkPurseAmount = async (receipt: BigNumber) => {
    let _purseStakingAvailableSupply: BigNumber =
      await purseStaking.availablePurseSupply();
    let _purseStakingTotalReceipt: BigNumber =
      await purseStaking.totalReceiptSupply();
    let receiptToken: BigNumber = purseStakingUserReceipt;
    let newArray: string[];
    let _receipt = parseFloat(formatUnits(receipt, "ether"));
    if (receiptToken.lte(0)) {
      let purseReward = receipt
        .mul(_purseStakingAvailableSupply)
        .div(_purseStakingTotalReceipt ?? 1);
      newArray = [
        "0",
        _receipt.toString(),
        formatBigNumber(purseReward, "ether").toString(),
        "0",
      ];
    } else {
      if (receipt.gt(receiptToken)) {
        let newReceipt = receipt.sub(receiptToken);
        let purseReward = newReceipt
          .mul(_purseStakingAvailableSupply)
          .div(_purseStakingTotalReceipt ?? 1);

        let purse = receiptToken
          .mul(_purseStakingAvailableSupply)
          .div(_purseStakingTotalReceipt ?? 1);
        newArray = [
          formatBigNumber(receiptToken, "ether"),
          formatBigNumber(newReceipt, "ether"),
          formatBigNumber(purseReward, "ether"),
          formatBigNumber(purse, "ether"),
        ];
      } else {
        let purse = receipt
          .mul(_purseStakingAvailableSupply)
          .div(_purseStakingTotalReceipt ?? 1);
        newArray = [
          _receipt.toString(),
          "0",
          "0",
          formatBigNumber(purse, "ether"),
        ];
      }
    }
    return newArray;
  };

  let purseStakingUserTotalReceipt = purseStakingUserReceipt.add(
    purseStakingUserNewReceipt
  );

  let apr =
    ((parseFloat(formatBigNumber(tokensPerInterval, "ether")) * 31536000) /
      parseFloat(formatBigNumber(purseStakingTotalStake, "ether"))) *
    100;
  // console.log(
  //   !!!purseStakingVestingData?.reduce((flag:number,curr:any)=> flag + +((Date.now() / 1000) > curr.endTime),0),
  //   purseStakingVestingData?.reduce((flag:number,curr:any)=> flag + +((Date.now() / 1000)> curr.endTime ),0)
  // )
  // console.log(!!!purseStakingVestingData?.reduce((flag:number,curr:any)=> flag + +((Date.now() / 1000) > curr.endTime),0),purseStakingEndTime===0 || purseStakingEndTime > (Date.now() / 1000),purseStakingEndTime)

  const renderCombinedStakeInfo = () => {
    return (
      <div className="ml-2">
        {stakingTVLData ? (
          <div
            style={{
              margin: "0 auto 20px auto",
              padding: "12px",
              width: "100%",
            }}
          >
            <TVLChart
              dataKey="totalAmountLiquidity"
              chartTitle="Total Staked"
              displayHeader
              displayTokenAmount
              height={210}
              size={"s"}
              tvlData={stakingTVLData}
              yAxisFormatter={RawDataFormatter}
              tooltipFormatter={RawNumberFormatter}
            />
          </div>
        ) : null}
        <form
          className="mb-0"
          onSubmit={async (event) => {
            event.preventDefault();
          }}
          style={{ paddingRight: "5%" }}
        >
          <div>
            <div>
              <div className="row mt-3 ml-2 mr-2">
                <div
                  style={{
                    width: "50%",
                    paddingRight: "5px",
                  }}
                >
                  <div>
                    <div className="textWhiteSmall mb-1">
                      <b style={{ fontFamily: "arial" }}>TVL:&nbsp;&nbsp;</b>
                      <ReactPopup
                        trigger={(open) => (
                          <span style={{ position: "relative", top: "-1.5px" }}>
                            <BsInfoCircleFill size={10} />
                          </span>
                        )}
                        on="hover"
                        position="top center"
                        offsetY={20}
                        offsetX={0}
                        contentStyle={{ padding: "3px" }}
                      >
                        <span className="textInfo">
                          Total PURSE amount in the PURSE Staking contract
                        </span>
                        <span className="textInfo mt-2">
                          Calculated based on PURSE staked by PURSE holders +
                          PURSE Distribution
                        </span>
                      </ReactPopup>
                    </div>
                    <div
                      className="textWhiteSmall mb-2"
                      style={{ color: "#000" }}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <b>
                            {FormatNumberToString({
                              bigNum: purseStakingTotalStake,
                              decimalPlaces: 5,
                              suffix: " PURSE",
                            })}
                          </b>
                          <b>
                            {FormatNumberToString({
                              bigNum: purseStakingTotalStake,
                              multiplier: PURSEPrice,
                              decimalPlaces: 5,
                              prefix: "(",
                              suffix: " USD)",
                            })}
                          </b>
                        </div>
                      )}
                    </div>
                    <div className="textWhiteSmall mb-1">
                      <b style={{ fontFamily: "arial" }}>APR:&nbsp;&nbsp;</b>
                      <ReactPopup
                        trigger={(open) => (
                          <span style={{ position: "relative", top: "-1.5px" }}>
                            <BsInfoCircleFill size={10} />
                          </span>
                        )}
                        on="hover"
                        position="right center"
                        offsetY={-23}
                        offsetX={0}
                        contentStyle={{ padding: "3px" }}
                      >
                        <span className="textInfo">
                          Percentage of the amount of tokens to distribute per
                          interval x 31,536,000 / Total staked (Pool)
                        </span>
                      </ReactPopup>
                    </div>
                    <div
                      className="textWhiteSmall mb-3"
                      style={{ color: "#000" }}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <b>
                          {`${apr.toLocaleString("en-US", {
                            maximumFractionDigits: 5,
                          })} %`}
                        </b>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ width: "50%" }}>
                  <div
                    className="textWhiteSmall mb-1"
                    style={{ minWidth: "151px" }}
                  >
                    <b style={{ fontFamily: "arial" }}>
                      Total Shares (Pool):&nbsp;&nbsp;
                    </b>
                    <ReactPopup
                      trigger={(open) => (
                        <span style={{ position: "relative", top: "-1.5px" }}>
                          <BsInfoCircleFill size={10} />
                        </span>
                      )}
                      on="hover"
                      position="top center"
                      offsetY={20}
                      offsetX={0}
                      contentStyle={{ padding: "3px" }}
                    >
                      <span className="textInfo">
                        Represents the total amount of PURSE in the PURSE
                        Staking contract
                      </span>
                      <span className="textInfo mt-2">
                        Total Shares (Pool) ≡ Total Staked (Pool)
                      </span>
                    </ReactPopup>
                  </div>
                  <div
                    className="textWhiteSmall mb-3"
                    style={{ color: "#000" }}
                  >
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <b>
                        {FormatNumberToString({
                          bigNum: purseStakingTotalReceipt,
                          decimalPlaces: 5,
                          suffix: " Shares",
                        })}
                      </b>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <hr></hr>
            {!isActive ? (
              <div
                className="card cardbody"
                style={{
                  height: "200px",
                  color: "White",
                }}
              >
                <div className="card-body">
                  <div>
                    <div
                      className="center textWhiteMedium mt-3 mb-3"
                      style={{ textAlign: "center" }}
                    >
                      <b>Connect wallet to stake PURSE</b>
                    </div>
                    <div className="center">
                      <button
                        type="button"
                        className="btn btn-primary mt-3"
                        onClick={() => setTrigger(true)}
                      >
                        {" "}
                        Connect{" "}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !isTargetChainMatch ? (
              <div
                className="card cardbody"
                style={{
                  height: "200px",
                  color: "White",
                }}
              >
                <div className="card-body">
                  <div>
                    <div
                      className="center textWhiteMedium mt-3 mb-3"
                      style={{ textAlign: "center" }}
                    >
                      <b>Switch chain to stake PURSE</b>
                    </div>
                    <div className="center">
                      <button
                        type="button"
                        className="btn btn-primary mt-3"
                        onClick={() => switchNetwork(targetChain)}
                      >
                        {" "}
                        Switch{" "}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row mt-3 ml-2 mr-2">
                <div
                  style={{
                    paddingRight: "5px",
                    width: "50%",
                  }}
                >
                  <div className="textWhiteSmall mb-1">
                    <b style={{ fontFamily: "arial" }}>Address:</b>
                  </div>
                  <div
                    className="textWhiteSmall mb-3"
                    style={{ color: "#000" }}
                  >
                    <b>{formatShortenAddress(account)}</b>
                  </div>
                  <div className="textWhiteSmall mb-1">
                    <b style={{ fontFamily: "arial" }}>PURSE Balance:</b>
                  </div>
                  <div
                    className="textWhiteSmall mb-3"
                    style={{ color: "#000" }}
                  >
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <b>
                        {FormatNumberToString({
                          bigNum: purseTokenUpgradableBalance,
                          decimalPlaces: 5,
                          suffix: " PURSE",
                        })}
                      </b>
                    )}
                  </div>

                  <div className="textWhiteSmall mb-1">
                    <b style={{ fontFamily: "arial" }}>Reward:&nbsp;&nbsp;</b>
                    {/* <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Represents the total amount of PURSE in the PURSE Staking contract</span>
                              <span className="textInfo mt-2">Total Shares (Pool) ≡ Total Staked (Pool)</span>
                            </ReactPopup> */}
                  </div>
                  <div
                    className="textWhiteSmall mb-2"
                    style={{ color: "#000" }}
                  >
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <b>
                        {FormatNumberToString({
                          bigNum: purseStakingReward,
                          decimalPlaces: 5,
                          suffix: " PURSE",
                        })}
                      </b>
                    )}
                  </div>
                  <Button
                    type="button"
                    className="btn btn-sm mb-3"
                    style={{ padding: "6px 20px" }}
                    variant="outline-success"
                    disabled={
                      isLoading ||
                      claimLoading ||
                      formatBigNumber(purseStakingReward, "ether") === "0"
                    }
                    onClick={(event) => {
                      claim();
                    }}
                  >
                    Claim
                  </Button>
                </div>
                <div style={{ width: "50%" }}>
                  <div>
                    <div className="textWhiteSmall mb-1">
                      <b style={{ fontFamily: "arial" }}>
                        Share Balance:&nbsp;&nbsp;
                      </b>
                      <ReactPopup
                        trigger={(open) => (
                          <span
                            style={{
                              position: "relative",
                              top: "-1.5px",
                            }}
                          >
                            <BsInfoCircleFill size={10} />
                          </span>
                        )}
                        on="hover"
                        position="top center"
                        offsetY={20}
                        offsetX={0}
                        contentStyle={{ padding: "3px" }}
                      >
                        <span className="textInfo">
                          Represents the amount of PURSE the user owns in the
                          PURSE Staking contract
                        </span>
                        <span className="textInfo mt-2">
                          Staked Balance = Share Balance / Total Shares (Pool) x
                          Total Staked (Pool)
                        </span>
                      </ReactPopup>
                    </div>
                    <div
                      className="textWhiteSmall mb-3"
                      style={{ color: "#000" }}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <b>
                          {FormatNumberToString({
                            bigNum: purseStakingUserTotalReceipt,
                            decimalPlaces: 5,
                            suffix: " Shares",
                          })}
                        </b>
                      )}
                    </div>
                    <div className="textWhiteSmaller">
                      <RiArrowRightFill />
                      <b
                        style={{
                          fontFamily: "arial",
                          textDecoration: "underline grey",
                        }}
                      >
                        {" "}
                        Unlocked Shares
                      </b>
                      &nbsp;&nbsp;
                      <ReactPopup
                        trigger={(open) => (
                          <span
                            style={{
                              position: "relative",
                              top: "-1.5px",
                            }}
                          >
                            <BsInfoCircleFill size={10} />
                          </span>
                        )}
                        on="hover"
                        position="top center"
                        offsetY={20}
                        offsetX={0}
                        contentStyle={{ padding: "3px" }}
                      >
                        <span className="textInfo">
                          Shares received previously when staked into contract
                          before the 21-Day Lock implementation
                        </span>
                      </ReactPopup>
                    </div>
                    <div
                      className="textWhiteSmall ml-3 mb-2"
                      style={{ color: "#000" }}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <b>
                            {FormatNumberToString({
                              bigNum: purseStakingUserReceipt,
                              decimalPlaces: 5,
                              suffix: " Shares",
                            })}
                          </b>
                          <b>
                            {`(${purseAmountUnlock.toLocaleString("en-US", {
                              maximumFractionDigits: 5,
                            })} PURSE)`}
                          </b>
                        </div>
                      )}
                    </div>
                    <div className="textWhiteSmaller">
                      <RiArrowRightFill />
                      <b
                        style={{
                          fontFamily: "arial",
                          textDecoration: "underline grey",
                        }}
                      >
                        {" "}
                        Locked Shares
                      </b>
                      &nbsp;&nbsp;
                      <ReactPopup
                        trigger={(open) => (
                          <span
                            style={{
                              position: "relative",
                              top: "-1.5px",
                            }}
                          >
                            <BsInfoCircleFill size={10} />
                          </span>
                        )}
                        on="hover"
                        position="top center"
                        offsetY={20}
                        offsetX={0}
                        contentStyle={{ padding: "3px" }}
                      >
                        <span className="textInfo">
                          Locked shares received when staked into contract after
                          the 21-Day Lock implementation
                        </span>
                      </ReactPopup>
                    </div>
                    <div
                      className="textWhiteSmall ml-3 mb-3"
                      style={{ color: "#000" }}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <b>
                            {FormatNumberToString({
                              bigNum: purseStakingUserNewReceipt,
                              decimalPlaces: 5,
                              suffix: " Shares",
                            })}
                          </b>
                          <b>
                            {`(${purseAmountLock.toLocaleString("en-US", {
                              maximumFractionDigits: 5,
                            })} PURSE)`}
                          </b>
                        </div>
                      )}
                    </div>
                    <div className="textWhiteSmall mb-1">
                      <b style={{ fontFamily: "arial" }}>
                        Staked Balance:&nbsp;&nbsp;
                      </b>
                      <ReactPopup
                        trigger={(open) => (
                          <span
                            style={{
                              position: "relative",
                              top: "-1.5px",
                            }}
                          >
                            <BsInfoCircleFill size={10} />
                          </span>
                        )}
                        on="hover"
                        position="top center"
                        offsetY={20}
                        offsetX={0}
                        contentStyle={{ padding: "3px" }}
                      >
                        <span className="textInfo">
                          Amount of PURSE user has staked + PURSE reward from
                          PURSE Distribution
                        </span>
                      </ReactPopup>
                    </div>
                    <div
                      className="textWhiteSmall mb-3"
                      style={{ color: "#000" }}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <b>
                            {FormatNumberToString({
                              bigNum: purseStakingUserStake,
                              decimalPlaces: 5,
                              suffix: " PURSE",
                            })}
                          </b>
                          <b>
                            {FormatNumberToString({
                              bigNum: purseStakingUserStake,
                              decimalPlaces: 5,
                              multiplier: PURSEPrice,
                              prefix: "(",
                              suffix: " USD)",
                            })}
                          </b>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div id="content" className="mt-4">
      <label
        className="textWhite center mb-2"
        style={{ fontSize: "40px", textAlign: "center" }}
      >
        <big>
          <b>PURSE Staking</b>
        </big>
      </label>
      <StakeShell
        claimVesting={claimVesting}
        onClickHandlerDeposit={onClickHandlerDeposit}
        onClickHandlerWithdraw={onClickHandlerWithdraw}
        stakeInfo={renderCombinedStakeInfo()}
        claimVestingLoading={claimVestingLoading}
        isTargetChainMatch={isTargetChainMatch}
        maxStake={purseTokenUpgradableBalance}
        maxUnstake={purseStakingUserTotalReceipt}
        purseStakingEndTime={purseStakingEndTime}
        stakeLoading={stakeLoading}
        vestingData={purseStakingVestingData}
      />
    </div>
  );
}
