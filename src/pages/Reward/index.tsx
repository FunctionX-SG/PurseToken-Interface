import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import "../../components/App.css";
import { isAddress, formatUnits, getAddress } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import * as Constants from "../../constants";
import {
  timeConverter,
  callContract,
  getShortTxHash,
  getMerkleProofUserAmount,
} from "../../components/utils";
import { useWeb3React } from "@web3-react/core";
import { Loading } from "../../components/Loading";
import { useToast } from "../../components/state/toast/hooks";
import { useProvider } from "../../components/state/provider/hooks";
import { usePursePrice } from "../../components/state/PursePrice/hooks";
import { useContract } from "../../components/state/contract/hooks";
import { useWalletTrigger } from "../../components/state/walletTrigger/hooks";
import { useNetwork } from "../../components/state/network/hooks";
import UserRewardAmount from "../../constants/pandoraValidAddressesAmounts.json";

export default function Rewards() {
  const targetChain = 1;
  const { isActive, account, chainId } = useWeb3React();
  const isCorrectChain = chainId === targetChain;
  const [, switchNetwork] = useNetwork();
  const [PURSEPrice] = usePursePrice();
  const { signer } = useProvider();
  const [, showToast] = useToast();

  const [, setTrigger] = useWalletTrigger();
  const { pandoraRewards } = useContract();

  const [message, setMessage] = useState("");
  const [addrValid, setAddrValid] = useState(false);
  const [otherAddress, setOtherAddress] = useState("");
  const [otherAddressAmount, setOtherAddressAmount] = useState("");
  const [rewardsAmount, setRewardsAmount] = useState(
    BigNumber.from(
      account
        ? UserRewardAmount[account as keyof typeof UserRewardAmount]?.Amount ??
            "0"
        : "0"
    )
  );

  const [rewardsAlreadyClaimed, setRewardsAlreadyClaimed] =
    useState<boolean>(false);
  const [rewardsStartTime, setRewardsStartTime] = useState<number>(0);
  const [rewardsEndTime, setRewardsEndTime] = useState<number>(0);
  const isBeforePeriod =
    parseFloat((Date.now() / 1000).toFixed(0)) <= rewardsStartTime;
  const isAfterPeriod =
    parseFloat((Date.now() / 1000).toFixed(0)) >= rewardsEndTime;
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!(account && isActive && pandoraRewards)) return;
    setIsDetailsLoading(true);
    Promise.all([
      pandoraRewards
        .isClaim(account, 0)
        .then((isClaimed: boolean) => setRewardsAlreadyClaimed(isClaimed)),
      pandoraRewards
        .rewardPeriods(0)
        .then(
          ({ startTime, endTime }: { startTime: BigInt; endTime: BigInt }) => {
            const startTimeFloat = parseFloat(startTime.toString());
            setRewardsStartTime(startTimeFloat);
            const endTimeFloat = parseFloat(endTime.toString());
            setRewardsEndTime(endTimeFloat);
          }
        ),
    ]).then(() => {
      const _retroactiveRewardsAmount = checkRewardsAmount(account);
      setRewardsAmount(_retroactiveRewardsAmount);
      setIsDetailsLoading(false);
    });
  }, [isActive, account, pandoraRewards]);

  const handleTxResponse = async (
    promise: Promise<any>,
    refresh?: () => void
  ) => {
    try {
      const tx = await promise;
      if (tx?.hash) {
        const link = `${Constants.ETH_MAINNET_BLOCKEXPLORER}/tx/${tx.hash}`;
        showToast("Transaction sent!", "success", link);
        setIsLoading(true);
        const res = await tx.wait();
        console.log(res);
        if (refresh !== undefined) {
          refresh();
        }
        setIsLoading(false);
        const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
          tx.hash
        )}`;
        showToast(message, "success", link);
        return true;
      } else {
        setIsLoading(false);
      }
      if (tx?.message.includes("user rejected transaction")) {
        showToast(`User rejected transaction.`, "failure");
      } else if (tx?.message.includes("insufficient funds for gas")) {
        showToast(`Insufficient funds for gas.`, "failure");
      } else if (tx?.reason) {
        showToast(`Execution reverted: ${tx.reason}`, "failure");
      } else {
        showToast("Something went wrong.", "failure");
      }
    } catch (err) {
      setIsLoading(false);
      showToast("Something went wrong.", "failure");
      console.log(err);
      return false;
    }
    return false;
  };

  const checkRewardsAmount = (address: string | undefined) => {
    if (!address) return BigNumber.from("0");
    let newAddress = getAddress(address);
    const res =
      UserRewardAmount[newAddress as keyof typeof UserRewardAmount]?.Amount;
    return BigNumber.from(res || "0");
  };

  const claimRewards = async () => {
    if (!(account && isActive && signer)) return;
    if (!isCorrectChain) {
      showToast(
        "On incorrect chain. Please switch to the Ethereum Network.",
        "failure"
      );
      return;
    }
    const currentTime = parseFloat((Date.now() / 1000).toFixed(0));

    if (currentTime > rewardsEndTime) {
      showToast("Claim Period Ended", "failure");
      return;
    }

    if (currentTime < rewardsStartTime) {
      showToast("Claim Period Not Started", "failure");
      return;
    }

    if (rewardsAmount.eq(0)) {
      showToast("No Rewards Available", "failure");
      return;
    }

    const merkleProof = await getMerkleProofUserAmount(
      account,
      UserRewardAmount
    );
    setIsLoading(true);
    let gasLimit;
    try {
      gasLimit = await pandoraRewards
        .connect(signer)
        .estimateGas.claimRewards(rewardsAmount, merkleProof);
      console.log(gasLimit);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      return;
    }
    console.log(gasLimit.mul(5));
    await handleTxResponse(
      callContract(
        signer,
        pandoraRewards,
        "claimRewards",
        rewardsAmount,
        merkleProof,
        { gasLimit: gasLimit.mul(5) }
      ),
      () => setIsLoading(false)
    );
  };

  const onChangeHandler = (maybeAddress: string) => {
    const isValidAddress = isAddress(maybeAddress);
    setMessage(
      maybeAddress === "" || isValidAddress ? "" : "Not a valid BEP-20 Address"
    );
    setOtherAddress(maybeAddress);
    setAddrValid(isValidAddress);
  };

  const onClickCheck = async () => {
    if (!addrValid) {
      showToast("Invalid input! Please check your input again", "failure");
      return;
    }
    const claimMessage = checkRewardsAmount(otherAddress);
    const otherAddressAmount =
      parseFloat(formatUnits(claimMessage, "ether")).toLocaleString("en-US", {
        maximumFractionDigits: 6,
      }) +
      " PURSE (" +
      (
        parseFloat(formatUnits(claimMessage, "ether")) * PURSEPrice
      ).toLocaleString("en-US", { maximumFractionDigits: 5 }) +
      " USD)";
    setOtherAddressAmount(otherAddressAmount);
  };

  const renderClaimContainer = () => {
    return (
      <div
        className="card cardbody mb-3"
        style={{
          width: "450px",
          minHeight: "400px",
          color: "white",
        }}
      >
        <div className="card-body">
          <div>
            <div>
              <div className="textWhiteSmall mb-1">
                <b>Address:</b>
              </div>
              <div className="textWhiteSmall mb-3">
                <b>{account}</b>
              </div>
            </div>
            <div>
              <div className="textWhiteSmall mb-1">
                <b>PURSE Reward:</b>
              </div>
              <div className="textWhiteSmall mb-3">
                {isDetailsLoading ? (
                  <Loading />
                ) : (
                  <b>
                    {parseFloat(
                      formatUnits(rewardsAmount, "ether")
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 6,
                    }) +
                      " PURSE (" +
                      (
                        parseFloat(formatUnits(rewardsAmount, "ether")) *
                        PURSEPrice
                      ).toLocaleString("en-US", {
                        maximumFractionDigits: 5,
                      }) +
                      " USD)"}
                  </b>
                )}
              </div>
            </div>
            {isDetailsLoading ? (
              <div className="center mt-2 mb-4">
                <Button
                  disabled
                  className="btn-block"
                  variant="secondary"
                  size="sm"
                  style={{ minWidth: "80px" }}
                >
                  <Loading />
                </Button>
              </div>
            ) : (
              <div>
                {isBeforePeriod ? (
                  <div className="center mt-2 mb-4">
                    <Button
                      disabled
                      className="btn-block"
                      variant="secondary"
                      size="sm"
                      style={{ minWidth: "80px" }}
                    >
                      Not Started
                    </Button>
                  </div>
                ) : isAfterPeriod ? (
                  <div className="center mt-2 mb-4">
                    <Button
                      disabled
                      className="btn-block"
                      variant="secondary"
                      size="sm"
                      style={{ minWidth: "80px" }}
                    >
                      Ended
                    </Button>
                  </div>
                ) : (
                  <div>
                    {!rewardsAlreadyClaimed ? (
                      rewardsAmount.eq(0) ? (
                        <div className="center mt-2 mb-4">
                          <Button
                            disabled
                            className="btn-block"
                            variant="secondary"
                            size="sm"
                            style={{ minWidth: "80px" }}
                          >
                            Not Available
                          </Button>
                        </div>
                      ) : (
                        <div className="center mt-2 mb-4">
                          <Button
                            className="btn-block"
                            disabled={isLoading}
                            variant="primary"
                            size="sm"
                            style={{ minWidth: "80px" }}
                            onClick={(event) => {
                              event.preventDefault();
                              claimRewards();
                            }}
                          >
                            {isLoading ? <Loading /> : <div>Claim</div>}
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="center mt-2 mb-4">
                        <Button
                          disabled
                          className="btn-block"
                          variant="secondary"
                          size="sm"
                          style={{ minWidth: "80px" }}
                        >
                          Claimed
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="float-left">
              <div className="textWhiteSmall mt-2 mb-2">
                <b>Check Another Address:</b>
              </div>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <div>
                <div className="input-group">
                  <input
                    type="text"
                    style={{ color: "white", backgroundColor: "#28313B" }}
                    className="form-control form-control-sm cardbody"
                    placeholder="ETH Address"
                    onChange={(e) => {
                      const value = e.target.value;
                      onChangeHandler(value);
                    }}
                    value={otherAddress}
                    required
                  />
                </div>
                <div
                  className="textWhiteSmall mt-1"
                  style={{ color: "#DC143C" }}
                >
                  {message}{" "}
                </div>
                <div className="center mt-2 mb-2">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-sm"
                    onClick={onClickCheck}
                  >
                    Check
                  </Button>
                </div>
                <div className="textWhiteSmall">
                  <b>{otherAddressAmount}</b>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderUserActionContainer = () => {
    if (!isActive) {
      return (
        <div
          className="card cardbody mb-3"
          style={{ width: "450px", minHeight: "400px", color: "white" }}
        >
          <div className="card-body">
            <div style={{ transform: "translate(0%, 150%)" }}>
              <div className="center textWhiteMedium">
                <b>Connect wallet to claim PURSE</b>
              </div>
              <div className="center">
                <button
                  type="submit"
                  className="btn btn-primary mt-4"
                  onClick={async () => {
                    setTrigger(true);
                  }}
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (!isCorrectChain) {
      return (
        <div
          className="card cardbody mb-3"
          style={{ width: "450px", minHeight: "400px", color: "white" }}
        >
          <div className="card-body">
            <div style={{ transform: "translate(0%, 150%)" }}>
              <div className="center textWhiteMedium">
                <b>Switch chain to claim PURSE</b>
              </div>
              <div className="center">
                <button
                  type="submit"
                  className="btn btn-primary mt-4"
                  onClick={async () => {
                    switchNetwork(targetChain);
                  }}
                >
                  Switch
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return renderClaimContainer();
    }
  };

  return (
    <div id="content" className="mt-4">
      <label
        className="textWhite center mb-5"
        style={{ fontSize: "36px", textAlign: "center" }}
      >
        <big>
          <b>PURSE x PANDORA</b>
        </big>
      </label>
      <div className="row center">
        <div
          className="card cardbody mb-3 ml-3 mr-3"
          style={{ width: "450px", minHeight: "400px", color: "white" }}
        >
          <div className="card-body">
            <span>
              <table
                className=" textWhiteSmall text-center mb-5"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr>
                    <th scope="col">Start Time</th>
                    <th scope="col">End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {isDetailsLoading ? (
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
                      <td>{timeConverter(rewardsStartTime)}</td>
                      <td>{timeConverter(rewardsEndTime)}</td>
                    </tr>
                  )}
                </tbody>
                <tbody>
                  <tr>
                    <td>SGT (GMT +8)</td>
                    <td>SGT (GMT +8)</td>
                  </tr>
                </tbody>
              </table>
              <ul>
                <li className="textWhiteSmaller">
                  PANDORA holders are eligible to claim PURSE within the start
                  and end times
                </li>
                <li className="textWhiteSmaller">
                  The amount of PURSE claimable by your wallet will be displayed
                  after connecting your wallet
                </li>
                <li className="textWhiteSmaller">
                  Check that you have sufficient ETH to pay for the transaction
                  fees
                </li>
                <li className="textWhiteSmaller">
                  Click “Claim” and confirm the transaction to claim your PURSE
                  tokens
                </li>
              </ul>
            </span>
          </div>
        </div>
        {renderUserActionContainer()}
      </div>
    </div>
  );
}
