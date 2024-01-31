import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import MediaQuery from "react-responsive";
import { Popup as ReactPopup } from "reactjs-popup";
import {
  BsFillQuestionCircleFill,
  BsInfoCircleFill,
  BsArrowRight,
} from "react-icons/bs";
import { AiFillAlert } from "react-icons/ai";
import { RiArrowRightFill } from "react-icons/ri";
import * as Constants from "../../constants";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import {
  fetcher,
  callContract,
  formatBigNumber,
  isSupportedChain,
  getShortTxHash,
} from "../utils";

import "../App.css";
import { useWeb3React } from "@web3-react/core";
import { Loading } from "../Loading";
import useSWR from "swr";
import { useToast } from "../state/toast/hooks";
import { useProvider } from "../state/provider/hooks";
import { usePursePrice } from "../state/PursePrice/hooks";
import { useContract } from "../state/contract/hooks";
import { useWalletTrigger } from "../state/walletTrigger/hooks";
import { useNetwork } from "../state/network/hooks";

export default function Stake() {
  const { isActive, chainId, account } = useWeb3React();
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

  const [mode, setMode] = useState("Stake");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [purseStakingUserReceipt, setPurseStakingUserReceipt] =
    useState<BigNumber>(BigNumber.from("0"));
  const [purseStakingUserNewReceipt, setPurseStakingUserNewReceipt] =
    useState<BigNumber>(BigNumber.from("0"));
  const [purseStakingUserWithdrawReward, setPurseStakingUserWithdrawReward] =
    useState(0);
  const [purseStakingVestingData, setPurseStakingVestingData] = useState<any[]>(
    []
  );
  const [purseStakingRemainingTime, setPurseStakingRemainingTime] = useState(0);
  const [purseStakingEndTime, setPurseStakingEndTime] = useState(0);
  const [purseStakingLockPeriod, setPurseStakingLockPeriod] = useState(0);
  const [purseAmountUnlock, setPurseAmountUnlock] = useState(0);
  const [purseAmountLock, setPurseAmountLock] = useState(0);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [sum30TransferAmount, setSum30TransferAmount] = useState(0);
  const [, setTrigger] = useWalletTrigger();
  const [isLoading, setIsLoading] = useState(true);
  const [valid, setValid] = useState(false);

  const { data: purseStakingTotalStake } = useSWR(
    {
      contract: "purseTokenUpgradable",
      method: "balanceOf",
      params: [Constants.PURSE_STAKING_ADDRESS],
    },
    {
      fetcher: fetcher(purseTokenUpgradable),
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

      let _purseStakingRemainingTime: number;
      if (_purseStakingUserLockTime === 0) {
        _purseStakingRemainingTime = 0;
      } else {
        let newTime =
          Math.round(+new Date() / 1000) - _purseStakingUserLockTime;
        if (newTime > purseStakingLockPeriod) {
          _purseStakingRemainingTime = 0;
        } else {
          _purseStakingRemainingTime = newTime;
        }
      }
      setPurseStakingRemainingTime(_purseStakingRemainingTime);
      setPurseStakingEndTime(
        _purseStakingUserLockTime > 0
          ? _purseStakingUserLockTime + purseStakingLockPeriod
          : 0
      );
    }
  }, [purseStakingUserInfo, purseStakingLockPeriod]);

  useEffect(() => {
    async function loadData() {
      let _purseStakingLockPeriod = await purseStaking.lockPeriod();
      setPurseStakingLockPeriod(parseFloat(_purseStakingLockPeriod.toString()));

      let response = await fetch(Constants.MONGO_RESPONSE_0_API);
      let myJson = await response.json();
      let _sum30TransferAmount = myJson["Transfer30Days"][0];
      setSum30TransferAmount(
        parseFloat(formatUnits(_sum30TransferAmount, "ether"))
      );

      let unlockShareAmount = (
        await checkPurseAmount(purseStakingUserReceipt)
      )[3];
      let lockShareAmount = (
        await checkPurseAmount(purseStakingUserNewReceipt)
      )[2];
      setPurseAmountUnlock(parseFloat(unlockShareAmount));
      setPurseAmountLock(parseFloat(lockShareAmount));

      setIsLoading(false);
    }
    loadData();
  }, [
    account,
    purseStaking,
    purseStakingUserReceipt,
    purseStakingUserNewReceipt,
  ]);

  const onChangeHandler = (event: string) => {
    setAmount(event);
    const amountRegex = /^\d+(\.\d{1,18})?$/;
    let result = amountRegex.test(event);
    if (event === "") {
      setMessage("");
    } else if (!result) {
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

  const onClickHandlerDeposit = async () => {
    let amountWei = parseUnits(amount, "ether");
    if (amountWei.gt(purseTokenUpgradableBalance)) {
      showToast("Insufficient PURSE to stake!", "failure");
    } else {
      await stake(amountWei);
    }
  };

  const onClickHandlerWithdraw = async () => {
    let receiptWei = parseUnits(amount, "ether");
    if (receiptWei.gt(purseStakingUserTotalReceipt)) {
      showToast("Insufficient Share to unstake!", "failure");
    } else {
      await unstake(receiptWei);
    }
  };

  const stake = async (amount: BigNumber) => {
    if (isActive) {
      if (amount.gt(purseStakingUserAllowance)) {
        await approvePurse();
      }
      setStakeLoading(true);
      try {
        const tx: any = await callContract(
          signer,
          purseStaking,
          "enter",
          amount
        );
        onChangeHandler("");
        if (tx?.hash) {
          const link = `https://bscscan.com/tx/${tx.hash}`;
          showToast("Transaction sent!", "success", link);
          await tx.wait();
          const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
            tx.hash
          )}`;
          showToast(message, "success", link);
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
      }

      setStakeLoading(false);
    }
  };

  const unstake = async (receipt: BigNumber) => {
    if (isActive) {
      setStakeLoading(true);
      try {
        const tx: any = await callContract(
          signer,
          purseStaking,
          "leave",
          receipt
        );
        onChangeHandler("");
        if (tx?.hash) {
          reloadVestingTable();
          const link = `https://bscscan.com/tx/${tx.hash}`;
          showToast("Transaction sent!", "success", link);
          await tx.wait();
          const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
            tx.hash
          )}`;
          showToast(message, "success", link);
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
      }

      setStakeLoading(false);
    }
  };

  const withdrawLocked = async () => {
    if (isActive) {
      setStakeLoading(true);
      try {
        const tx: any = await callContract(
          signer,
          purseStaking,
          "withdrawLockedAmount"
        );
        if (tx?.hash) {
          const link = `https://bscscan.com/tx/${tx.hash}`;
          showToast("Transaction sent!", "success", link);
          await tx.wait();
          const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
            tx.hash
          )}`;
          showToast(message, "success", link);
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
      }

      setStakeLoading(false);
    }
  };

  const approvePurse = async () => {
    if (isActive) {
      try {
        const tx: any = await callContract(
          signer,
          purseTokenUpgradable,
          "approve",
          Constants.PURSE_STAKING_ADDRESS,
          "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        );
        if (tx?.hash) {
          const link = `https://bscscan.com/tx/${tx.hash}`;
          showToast("Transaction sent!", "success", link);
          await tx.wait();
          const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
            tx.hash
          )}`;
          showToast(message, "success", link);
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
      }
    }
  };

  const claim = async () => {
    if (isActive) {
      setStakeLoading(true);
      try {
        const tx: any = await callContract(
          signer,
          treasuryContract,
          "claimRewards",
          account
        );
        if (tx?.hash) {
          const link = `https://bscscan.com/tx/${tx.hash}`;
          showToast("Transaction sent!", "success", link);
          await tx.wait();
          const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
            tx.hash
          )}`;
          showToast(message, "success", link);
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
      }

      setStakeLoading(false);
    }
  };

  const claimVesting = async () => {
    if (isActive) {
      setStakeLoading(true);
      try {
        let tx: any;
        if (
          purseStakingUserWithdrawReward > 0 &&
          purseStakingEndTime < Date.now() / 1000
        ) {
          tx = await callContract(signer, purseStaking, "withdrawLockedAmount");
        } else {
          tx = await callContract(
            signer,
            purseStakingVesting,
            "vestCompletedSchedules"
          );
        }
        if (tx?.hash) {
          reloadVestingTable();
          const link = `https://bscscan.com/tx/${tx.hash}`;
          showToast("Transaction sent!", "success", link);
          await tx.wait();
          const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
            tx.hash
          )}`;
          showToast(message, "success", link);
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
      }

      setStakeLoading(false);
    }
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

  const getISOStringWithoutSecsAndMillisecs2 = (x: any) => {
    var now = new Date(x);
    now.setSeconds(0, 0);
    var stamp = now.toString().substring(3, 21);

    return stamp;
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

  const renderUserActionContainer = () => {
    return (
      <div style={{ marginLeft: "8px" }}>
        <div
          style={{
            backgroundColor: "#fAf9f6",
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
                  Unstake and earn PURSE rewards using your share
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
                {mode === "Stake" ? "PURSE" : "Share"}{" "}
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
                  if (valid) {
                    if (mode === "Stake") {
                      await onClickHandlerDeposit();
                    } else if (mode === "Unstake") {
                      await onClickHandlerWithdraw();
                    }
                  }
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
                    onChangeHandler(
                      formatBigNumber(purseTokenUpgradableBalance, "ether")
                    );
                  } else if (mode === "Unstake") {
                    onChangeHandler(
                      formatBigNumber(purseStakingUserTotalReceipt, "ether")
                    );
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
                Amount
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

            {/* V2 Claim */}
            {purseStakingUserWithdrawReward > 0 ? (
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
                  {purseStakingUserWithdrawReward.toLocaleString("en-US", {
                    maximumFractionDigits: 5,
                  }) + " PURSE"}
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
                    purseStakingEndTime * 1000
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
                  {purseStakingEndTime > Date.now() / 1000 ? (
                    <div>Not ready</div>
                  ) : (
                    <div>Available</div>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* V3 Claim */}
            {purseStakingVestingData.map((vestingData: any) => {
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
                    {parseFloat(
                      formatBigNumber(vestingData.quantity, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 5,
                    })}{" "}
                    PURSE
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
                  stakeLoading ||
                  ((purseStakingEndTime === 0 ||
                    purseStakingEndTime > Date.now() / 1000) &&
                    !!!purseStakingVestingData?.reduce(
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
          minWidth: "50px",
          width: "35%",
        }}
      >
        {renderUserActionContainer()}
      </div>
    );
  };

  const renderCombinedStakeInfo = () => {
    return (
      <form
        className="mb-0"
        onSubmit={async (event) => {
          event.preventDefault();
        }}
      >
        <div className="rowC center">
          <div className="card cardbody">
            <div className="card-body">
              <div
                className="mb-4"
                style={{ backgroundColor: "#ba00ff", padding: "20px 40px" }}
              >
                <div className="rowC textWhiteSmaller ml-2 mb-2">
                  <div className="ml-2" style={{ color: "#fff" }}>
                    <b>
                      Maximize your rewards with PURSE Staking. The more you
                      stake, the more you earn, claimable any time without
                      interruptions to your continuous earning potential.
                    </b>
                  </div>
                </div>
                <div
                  className="rowC textWhiteSmaller ml-2 mb-2"
                  style={{ color: "#fff" }}
                >
                  <a
                    href="https://pundix-purse.gitbook.io/untitled/products/purse-staking-rewards"
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

              <div>
                {/* {purseStakingUserWithdrawReward>0 ?
                      <div>
                        {purseStakingRemainingTime>0 ?
                          <div className='mb-3 textWhiteSmall'>
                            <div className='row ml-2 mb-1'>
                              <div style={{width:"50%", minWidth:"250px"}}>
                                <div className='mb-1'>PURSE Locked For 21 Days:&nbsp;&nbsp;
                                  <ReactPopup trigger={open => (
                                    <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                                    )}
                                    on="hover"
                                    position="top center"
                                    offsetY={20}
                                    offsetX={0}
                                    contentStyle={{ padding: '3px' }}>
                                    <span className="textInfo">PURSE locked during these 21 days will not earn any rewards</span>
                                  </ReactPopup>
                                </div>
                                <div className="mb-3" style={{ color : "#000" }}><b>{(purseStakingUserWithdrawReward).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " PURSE"}</b></div>
                              </div>
                            </div>
                            <div style={{ width: "50%", minWidth: "250px" }}>
                              <div className="mb-1">Remaining Lock Time:</div>
                              <div className="mb-3" style={{ color: "#000" }}>
                                <MdLockClock />
                                &nbsp;&nbsp;
                                <b>
                                  {secondsToDhms(
                                    purseStakingLockPeriod,
                                    purseStakingRemainingTime
                                  )}
                                </b>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : isLoading ? (
                        <Loading />
                      ) : (
                        <div className="mb-3 textWhiteSmall">
                          <div className="row ml-2 mb-1">
                            <div style={{ width: "50%", minWidth: "250px" }}>
                              <div className="mb-1">
                                Withdrawable PURSE:&nbsp;&nbsp;
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
                                  <span className="textInfo mb-2">
                                    Click the button below to withdraw the PURSE
                                  </span>
                                  <span className="textInfo">
                                    If not it will automatically be withdrawn
                                    when unstake
                                  </span>
                                </ReactPopup>
                              </div>
                              <div className="mb-3" style={{ color: "#000" }}>
                                <b>
                                  {purseStakingUserWithdrawReward.toLocaleString(
                                    "en-US",
                                    { maximumFractionDigits: 5 }
                                  ) + " PURSE"}
                                </b>
                              </div>
                              <Button
                                type="button"
                                className="btn btn-sm mb-3"
                                variant="outline-success"
                                disabled={stakeLoading}
                                onClick={(event) => {
                                  withdrawLocked();
                                }}
                              >
                                Withdraw
                              </Button>
                            </div>
                            <div style={{ width: "50%", minWidth: "250px" }}>
                              <div className="mb-1">Remaining Lock Time:</div>
                              <div className="mb-2" style={{ color: "#000" }}>
                                <b>21-Day Lock is over</b>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    :
                      <div></div>
                    } */}

                <div></div>
                <hr></hr>
                <div className="row mt-3 ml-2">
                  <div
                    style={{
                      width: "50%",
                      minWidth: "250px",
                      paddingRight: "5%",
                    }}
                  >
                    <div>
                      <div className="textWhiteSmall mb-1">
                        <b>APR:&nbsp;&nbsp;</b>
                        <ReactPopup
                          trigger={(open) => (
                            <span
                              style={{ position: "relative", top: "-1.5px" }}
                            >
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
                        className="textWhiteSmall mb-2"
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

                    <div
                      style={{
                        paddingRight: "2px",
                        width: "50%",
                        minWidth: "250px",
                      }}
                    >
                      <div className="textWhiteSmall mb-1">
                        <b>Past 30 Days Distribution Sum:</b>
                      </div>
                      <div
                        className="textWhiteSmall mb-2"
                        style={{ color: "#000" }}
                      >
                        {isLoading ? (
                          <Loading />
                        ) : (
                          <b>
                            {sum30TransferAmount.toLocaleString("en-US", {
                              maximumFractionDigits: 5,
                            }) + " PURSE"}
                          </b>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ width: "50%", minWidth: "250px" }}>
                    <div className="textWhiteSmall mb-1">
                      <b>Total Staked (Pool):&nbsp;&nbsp;</b>
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
                        <b>
                          {parseFloat(
                            formatBigNumber(purseStakingTotalStake, "ether")
                          ).toLocaleString("en-US", {
                            maximumFractionDigits: 5,
                          }) +
                            " PURSE (" +
                            (
                              parseFloat(
                                formatBigNumber(purseStakingTotalStake, "ether")
                              ) * PURSEPrice
                            ).toLocaleString("en-US", {
                              maximumFractionDigits: 5,
                            }) +
                            " USD)"}
                        </b>
                      )}
                    </div>
                    <div className="textWhiteSmall mb-1">
                      <b>Total Share (Pool):&nbsp;&nbsp;</b>
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
                          Total Share (Pool) ≡ Total Staked (Pool)
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
                          {parseFloat(
                            formatBigNumber(purseStakingTotalReceipt, "ether")
                          ).toLocaleString("en-US", {
                            maximumFractionDigits: 5,
                          }) + " Share (100%)"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <hr></hr>
              {!isActive ? (
                <div className="center">
                  <div
                    className="card cardbody"
                    style={{
                      minWidth: "300px",
                      width: "900px",
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
                </div>
              ) : !isSupportedChain(chainId) ? (
                <div className="center">
                  <div
                    className="card cardbody"
                    style={{
                      minWidth: "300px",
                      width: "900px",
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
                            onClick={() => switchNetwork()}
                          >
                            {" "}
                            Switch{" "}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row mt-3 ml-2">
                  <div
                    style={{
                      width: "50%",
                      minWidth: "250px",
                      paddingRight: "5%",
                    }}
                  >
                    <div className="textWhiteSmall mb-1">
                      <b>Address:</b>
                    </div>
                    <div
                      className="textWhiteSmall mb-2"
                      style={{ color: "#000" }}
                    >
                      <b>{account}</b>
                    </div>
                    <div className="textWhiteSmall mb-1">
                      <b>PURSE Balance:</b>
                    </div>
                    <div
                      className="textWhiteSmall mb-2"
                      style={{ color: "#000" }}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <b>
                          {parseFloat(
                            formatBigNumber(
                              purseTokenUpgradableBalance,
                              "ether"
                            )
                          ).toLocaleString("en-US", {
                            maximumFractionDigits: 5,
                          }) + " PURSE"}
                        </b>
                      )}
                    </div>

                    <div className="textWhiteSmall mb-1">
                      <b>Reward:&nbsp;&nbsp;</b>
                      {/* <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Represents the total amount of PURSE in the PURSE Staking contract</span>
                              <span className="textInfo mt-2">Total Share (Pool) ≡ Total Staked (Pool)</span>
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
                          {parseFloat(
                            formatBigNumber(purseStakingReward, "ether")
                          ).toLocaleString("en-US", {
                            maximumFractionDigits: 5,
                          }) + " PURSE"}
                        </b>
                      )}
                    </div>
                    <Button
                      type="button"
                      className="btn btn-sm mb-3"
                      variant="outline-success"
                      disabled={
                        formatBigNumber(purseStakingReward, "ether") === "0" ||
                        stakeLoading
                      }
                      onClick={(event) => {
                        claim();
                      }}
                    >
                      Claim
                    </Button>
                  </div>

                  <div style={{ width: "50%", minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div>
                        <div className="textWhiteSmall mb-1">
                          <b>Staked Balance:&nbsp;&nbsp;</b>
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
                              Amount of PURSE user has staked + PURSE reward
                              from PURSE Distribution
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
                            <b>
                              {parseFloat(
                                formatBigNumber(purseStakingUserStake, "ether")
                              ).toLocaleString("en-US", {
                                maximumFractionDigits: 5,
                              }) +
                                " PURSE (" +
                                (
                                  parseFloat(
                                    formatBigNumber(
                                      purseStakingUserStake,
                                      "ether"
                                    )
                                  ) * PURSEPrice
                                ).toLocaleString("en-US", {
                                  maximumFractionDigits: 5,
                                }) +
                                " USD)"}
                            </b>
                          )}
                        </div>
                        <div className="textWhiteSmall mb-1">
                          <b>Share Balance:&nbsp;&nbsp;</b>
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
                              Represents the amount of PURSE the user owns in
                              the PURSE Staking contract
                            </span>
                            <span className="textInfo mt-2">
                              Staked Balance = Share Balance / Total Share
                              (Pool) x Total Staked (Pool)
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
                            <b>
                              {parseFloat(
                                formatBigNumber(
                                  purseStakingUserTotalReceipt,
                                  "ether"
                                ).toString()
                              ).toLocaleString("en-US", {
                                maximumFractionDigits: 5,
                              }) + " Share"}
                            </b>
                          )}
                        </div>
                        <div className="textWhiteSmaller">
                          <RiArrowRightFill />
                          <b style={{ textDecoration: "underline grey" }}>
                            {" "}
                            Unlocked Share
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
                              Share received previously when staked into
                              contract before the 21-Day Lock implementation
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
                            <b>
                              {parseFloat(
                                formatBigNumber(
                                  purseStakingUserReceipt,
                                  "ether"
                                )
                              ).toLocaleString("en-US", {
                                maximumFractionDigits: 5,
                              }) +
                                " Share (" +
                                purseAmountUnlock.toLocaleString("en-US", {
                                  maximumFractionDigits: 5,
                                }) +
                                " PURSE)"}
                            </b>
                          )}
                        </div>
                        <div className="textWhiteSmaller">
                          <RiArrowRightFill />
                          <b style={{ textDecoration: "underline grey" }}>
                            {" "}
                            Locked Share
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
                              Locked share received when staked into contract
                              after the 21-Day Lock implementation
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
                            <b>
                              {parseFloat(
                                formatBigNumber(
                                  purseStakingUserNewReceipt,
                                  "ether"
                                )
                              ).toLocaleString("en-US", {
                                maximumFractionDigits: 5,
                              }) +
                                " Share (" +
                                purseAmountLock.toLocaleString("en-US", {
                                  maximumFractionDigits: 5,
                                }) +
                                " PURSE)"}
                            </b>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
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
      <MediaQuery minWidth={601}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "65%" }}>{renderCombinedStakeInfo()}</div>
          {isActive && isSupportedChain(chainId)
            ? renderWideUserActionContainer()
            : null}
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={600}>
        <div>
          {renderCombinedStakeInfo()}
          {isActive && isSupportedChain(chainId)
            ? renderUserActionContainer()
            : null}
        </div>
      </MediaQuery>
    </div>
  );
}
