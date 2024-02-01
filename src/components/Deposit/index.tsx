import React from "react";
import { useState } from "react";
import asterisk from "../../assets/images/asterisk.png";
import exlink from "../../assets/images/link.png";
import purse from "../../assets/images/purse.png";
import pancake from "../../assets/images/pancakeswap.png";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import "../App.css";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { useWeb3React } from "@web3-react/core";
import RestakingFarm from "../../abis/RestakingFarm.json";
import IPancakePair from "../../abis/IPancakePair.json";
import { BigNumber, ethers } from "ethers";
import {
  callContract,
  formatBigNumber,
  getShortTxHash,
  isSupportedChain,
  fetcher,
} from "../utils";
import * as Constants from "../../constants";
import ConnectWallet from "../ConnectWallet";
import useSWR from "swr";
import { Loading } from "../Loading";
import { useToast } from "../state/toast/hooks";
import { useProvider } from "../state/provider/hooks";
import { useWalletTrigger } from "../state/walletTrigger/hooks";
import { useNetwork } from "../state/network/hooks";

export default function Deposit(props: any) {
  const {
    selectedPoolInfo,
    pairName,
    harvest,
    lpTokenAddress,
    purseTokenUpgradableBalance,
    lpStaked,
    purseEarned,
  } = props;

  const { account, isActive, chainId } = useWeb3React();
  const { bscProvider, signer } = useProvider();
  const [, switchNetwork] = useNetwork();
  const [, showToast] = useToast();
  const [, setTrigger] = useWalletTrigger();

  const lpTokenContract = lpTokenAddress
    ? new ethers.Contract(lpTokenAddress, IPancakePair.abi, bscProvider)
    : null;

  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [valid, setValid] = useState(true);
  const [isDeposit, setIsDeposit] = useState(false);
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [isHarvest, setIsHarvest] = useState(false);

  const { data: lpTokenBalance } = useSWR(
    {
      contract: "lpTokenContract",
      method: "balanceOf",
      params: [account],
    },
    {
      fetcher: fetcher(lpTokenContract),
      refreshInterval: 5000,
    }
  );

  const { data: lpTokenAllowance } = useSWR(
    {
      contract: "lpTokenContract",
      method: "allowance",
      params: [account, Constants.RESTAKING_FARM_ADDRESS],
    },
    {
      fetcher: fetcher(lpTokenContract),
      refreshInterval: 5000,
    }
  );

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
    if (amount === "" || amount === "0.0") {
      return;
    }
    const amountWei = parseUnits(amount, "ether");
    if (amountWei.lte(0)) {
      showToast("Amount cannot less than or equal to 0", "failure");
      // } else if (amountWei.gt(lpTokenBalance)) {
      //   showToast("Not enough funds","failure")
    } else {
      setIsDeposit(true);
      await deposit(amountWei);
      setIsDeposit(false);
    }
  };

  const onClickHandlerWithdraw = async () => {
    if (amount === "" || amount === "0.0") {
      return;
    }
    const amountWei = parseUnits(amount, "ether");
    if (amountWei.lte(0)) {
      showToast("Amount cannot less than or equal to 0", "failure");
      // } else if (amountWei.gt(lpStaked?.amount)) {
      //   showToast("Withdraw tokens more than deposit LP tokens","failure")
    } else {
      setIsWithdraw(true);
      await withdraw(amountWei);
      setIsWithdraw(false);
    }
  };

  const deposit = async (amount: BigNumber) => {
    if (isActive) {
      if (amount.gt(lpTokenAllowance)) {
        await approve();
      }
      const restakingFarm = new ethers.Contract(
        Constants.RESTAKING_FARM_ADDRESS,
        RestakingFarm.abi
      );
      try {
        const tx: any = await callContract(
          signer,
          restakingFarm,
          "deposit",
          lpTokenAddress,
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
    }
  };

  const withdraw = async (amount: BigNumber) => {
    if (isActive) {
      const restakingFarm = new ethers.Contract(
        Constants.RESTAKING_FARM_ADDRESS,
        RestakingFarm.abi
      );
      try {
        const tx: any = await callContract(
          signer,
          restakingFarm,
          "withdraw",
          lpTokenAddress,
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
    }
  };

  const approve = async () => {
    if (isActive) {
      try {
        const tx: any = await callContract(
          signer,
          lpTokenContract,
          "approve",
          Constants.RESTAKING_FARM_ADDRESS,
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

  return (
    <div className="mt-0">
      <h2 className="center textWhite" style={{ fontSize: "40px" }}>
        <b>{pairName}</b>
      </h2>

      <div className="center" style={{ color: "#999", textAlign: "center" }}>
        Deposit {pairName} LP Token and earn PURSE&nbsp;!
      </div>
      <br />
      <div className="card mb-2 cardbody" style={{ color: "#999" }}>
        <div className="card-body">
          <div className="float-left row mb-3 ml-1" style={{ width: "70%" }}>
            <div
              className="dropdown dropdownLink"
              style={{ fontSize: "12px" }}
              onClick={() => {
                window.open(selectedPoolInfo.getLPLink, "_blank");
              }}
            >
              Get {pairName}{" "}
              <img src={exlink} className="mb-1" height="10" alt="" />
            </div>
            <div
              className="dropdown dropdownLink"
              style={{ fontSize: "12px" }}
              onClick={() => {
                window.open(selectedPoolInfo.lpContract, "_blank");
              }}
            >
              View&nbsp;Contract&nbsp;
              <img src={exlink} className="mb-1" height="10" alt="" />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-success btn-sm float-right center mb-3"
            style={{ position: "absolute", right: "20px" }}
            disabled={isHarvest || !isSupportedChain(chainId)}
            onClick={async (event) => {
              event.preventDefault();
              setIsHarvest(true);
              await harvest();
              setIsHarvest(false);
            }}
          >
            <small>Harvest</small>
          </button>{" "}
          <br /> <br />
          <table
            className="table table-borderless text-center"
            style={{ color: "#999", fontSize: "15px" }}
          >
            <thead>
              <tr>
                <th scope="col">{pairName} LP Staked </th>
                <th scope="col">PURSE Earned</th>
              </tr>
              <tr>
                <th scope="col">
                  <img src={pancake} height="25" alt="" />
                </th>
                <th scope="col">
                  <img src={purse} height="30" alt="" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {parseFloat(
                    formatBigNumber(lpStaked?.amount, "ether")
                  ).toLocaleString("en-US", { maximumFractionDigits: 5 })}
                </td>
                <td>
                  {parseFloat(
                    formatBigNumber(purseEarned, "ether")
                  ).toLocaleString("en-US", { maximumFractionDigits: 3 })}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="card mb-4 cardbody">
            <div className="card-body">
              {!isActive ? (
                <div className="rowC center">
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      setTrigger(true);
                    }}
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : !isSupportedChain(chainId) ? (
                <div className="rowC center">
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      switchNetwork();
                    }}
                  >
                    Switch Chain
                  </button>
                </div>
              ) : (
                <div>
                  <div>
                    <label
                      className="float-left mt-1"
                      style={{
                        color: "#999",
                        fontSize: "15px",
                        width: "40%",
                        minWidth: "120px",
                      }}
                    >
                      <b>Start Farming</b>
                    </label>
                    <span
                      className="float-right mb-1 mt-1"
                      style={{ color: "#999", fontSize: "15px" }}
                    >
                      <span>
                        LP Balance&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{" "}
                        {parseFloat(
                          formatBigNumber(lpTokenBalance, "ether")
                        ).toLocaleString("en-US", { maximumFractionDigits: 3 })}
                      </span>
                      <span>
                        <br />
                        PURSE Balance&nbsp;:{" "}
                        {parseFloat(
                          formatBigNumber(purseTokenUpgradableBalance, "ether")
                        ).toLocaleString("en-US", { maximumFractionDigits: 5 })}
                      </span>
                    </span>
                  </div>
                  <br />
                  <br />
                  <br />

                  <div>
                    <form
                      className="mb-1"
                      onSubmit={(event) => {
                        event.preventDefault();
                      }}
                    >
                      <div className="input-group mt-0">
                        <input
                          type="text"
                          style={{
                            color: "#999",
                            backgroundColor: "#28313b",
                            fontSize: "15px",
                          }}
                          className="form-control form-control-lg cardbody"
                          placeholder="0"
                          onPaste={(event) => {
                            event.preventDefault();
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            onChangeHandler(value);
                          }}
                          value={amount}
                          disabled={isDeposit || isWithdraw}
                          required
                        />
                        <div className="input-group-append">
                          <div
                            className="input-group-text cardbody"
                            style={{ color: "#999", fontSize: "15px" }}
                          >
                            <img src={pancake} height="20" alt="" />
                            &nbsp;&nbsp;LP
                          </div>
                        </div>
                      </div>
                      <div style={{ color: "#DC143C" }}>{message} </div>

                      <div className="row center mt-3">
                        <ButtonGroup className="mt-2 ml-3">
                          <Button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isDeposit || isWithdraw}
                            style={{ width: "105px" }}
                            onClick={async (event) => {
                              if (valid) await onClickHandlerDeposit();
                            }}
                          >
                            {isDeposit ? <Loading /> : <div>Deposit</div>}
                          </Button>
                          <Button
                            type="text"
                            variant="outline-primary"
                            className="btn"
                            disabled={isDeposit || isWithdraw}
                            onClick={(event) => {
                              setAmount(formatUnits(lpTokenBalance, "ether"));
                              onChangeHandler(
                                formatUnits(lpTokenBalance, "ether")
                              );
                            }}
                          >
                            Max
                          </Button>
                          &nbsp;&nbsp;&nbsp;
                        </ButtonGroup>
                        <ButtonGroup className="mt-2 ml-3">
                          <Button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isDeposit || isWithdraw}
                            style={{ width: "105px" }}
                            onClick={async (event) => {
                              if (valid) await onClickHandlerWithdraw();
                            }}
                          >
                            {isWithdraw ? <Loading /> : <div>Withdraw</div>}
                          </Button>
                          <Button
                            type="text"
                            variant="outline-primary"
                            disabled={isDeposit || isWithdraw}
                            className="btn"
                            onClick={(event) => {
                              setMessage("");
                              onChangeHandler(
                                formatUnits(lpStaked?.amount, "ether")
                              );
                            }}
                          >
                            Max
                          </Button>
                          &nbsp;&nbsp;&nbsp;
                        </ButtonGroup>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center" style={{ color: "#999" }}>
        <img src={asterisk} alt={"*"} height="15" />
        &nbsp;
        <small>
          Every time you stake & unstake LP tokens, the contract will
          automatically harvest PURSE rewards for you!
        </small>
      </div>
      <ConnectWallet />
    </div>
  );
}
