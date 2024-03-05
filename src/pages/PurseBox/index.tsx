import React, { useEffect, useState } from "react";
import MediaQuery from "react-responsive";
import red from "../../assets/images/red.png";
import blue from "../../assets/images/blue.png";
import green from "../../assets/images/green.png";
import orange from "../../assets/images/orange.png";
import { Loading } from "../../components/Loading";
import purple from "../../assets/images/purple.png";
import { useWeb3React } from "@web3-react/core";
import Button from "react-bootstrap/esm/Button";
import { useProvider } from "../../components/state/provider/hooks";
import { useNetwork } from "../../components/state/network/hooks";
import { useContract } from "../../components/state/contract/hooks";
import { useToast } from "../../components/state/toast/hooks";

import * as Constants from "../../constants";
import { useWalletTrigger } from "../../components/state/walletTrigger/hooks";
import {
  FormatBigIntToString,
  callContract,
  getShortTxHash,
} from "../../components/utils";

const MintContainer = () => {
  const { isActive, chainId, account } = useWeb3React();
  const targetChain = Constants.ETH_CHAIN_ID;
  const isTargetChainMatch = chainId === targetChain;
  const [, switchNetwork] = useNetwork();
  const [, showToast] = useToast();
  const [, setTrigger] = useWalletTrigger();

  const { purseToken404UpgradableEth } = useContract();

  const { signer } = useProvider();
  const [mintingCost, setMintingCost] = useState<bigint>();
  const [purseRatio, setPurseRatio] = useState<bigint>();
  const [userBalance, setUserBalance] = useState<bigint>();
  const [mintAmount, setMintAmount] = useState<number>(1);
  const [maxMint, setMaxMint] = useState<number>(0);
  const [availableTokens, setAvailableTokens] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!(isTargetChainMatch && purseToken404UpgradableEth)) return;
    setIsLoading(true);
    Promise.all([
      Promise.all([
        purseToken404UpgradableEth.erc721MaxTokenId(),
        purseToken404UpgradableEth.getERC721QueueLength(),
        purseToken404UpgradableEth.erc721TotalSupply(),
      ]).then(
        ([maxTokenIdRaw, queueLength, totalSupply]: [
          bigint,
          bigint,
          bigint
        ]) => {
          setAvailableTokens(
            Number(
              BigInt(maxTokenIdRaw) -
                BigInt(2 ** 255) +
                BigInt(queueLength) -
                BigInt(totalSupply)
            )
          );
        }
      ),
      purseToken404UpgradableEth
        .balanceOf(account)
        .then((userBalance: bigint) => setUserBalance(userBalance)),
      purseToken404UpgradableEth
        .units()
        .then((purseRatio: bigint) => setPurseRatio(purseRatio)),
      purseToken404UpgradableEth.mintingCost().then((res: bigint) => {
        if (res !== undefined) setMintingCost(res);
      }),
    ]).then(() => setIsLoading(false));
  }, [account, isTargetChainMatch, purseToken404UpgradableEth]);

  useEffect(() => {
    if (!(userBalance !== undefined && purseRatio !== undefined)) return;
    const maxMint = Math.floor(Number(userBalance / purseRatio));
    setMaxMint(
      availableTokens !== undefined
        ? Math.min(maxMint, availableTokens)
        : maxMint
    );
  }, [userBalance, purseRatio, availableTokens]);
  const handleTxResponse = async (
    promise: Promise<any>,
    refresh?: () => void
  ) => {
    try {
      const tx = await promise;
      if (tx?.hash) {
        const link = `${Constants.ETH_MAINNET_BLOCKEXPLORER}/tx/${tx.hash}`;
        showToast("Transaction sent!", "success", link);
        await tx.wait();
        if (refresh !== undefined) {
          refresh();
        }
        const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(
          tx.hash
        )}`;
        showToast(message, "success", link);
        return true;
      } else if (tx?.message.includes("user rejected transaction")) {
        showToast(`User rejected transaction.`, "failure");
      } else if (tx?.message.includes("insufficient funds for gas")) {
        showToast(`Insufficient funds for gas.`, "failure");
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

  const handleMint = async () => {
    if (!purseToken404UpgradableEth) {
      return;
    }
    const mintCost: bigint = await purseToken404UpgradableEth.mintingCost();
    if (!mintCost) return;
    setMintingCost(mintCost);
    const etherCost: bigint = BigInt(mintCost) * BigInt(mintAmount);
    await handleTxResponse(
      callContract(
        signer,
        purseToken404UpgradableEth,
        "mintERC721",
        mintAmount,
        {
          value: etherCost,
        }
      )
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = Number(event.target.value);
    if (input === undefined) return;
    if (availableTokens && input > availableTokens) {
      setMintAmount(availableTokens);
    } else {
      setMintAmount(input);
    }
  };

  return (
    <div
      className="card cardbody"
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        margin: "0 auto",
        padding: "2%",
        width: "50%",
        border: "2px inset grey",
        borderRadius: "10px",
      }}
    >
      {" "}
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
                <text>Connect wallet to mint PURSE BOX</text>
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
                <text>Switch chain to mint PURSE BOX</text>
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
      ) : !isLoading ? (
        <>
          {availableTokens !== undefined ? (
            <text>
              Tokens Available: {availableTokens.toLocaleString()} PURSEBOX
            </text>
          ) : null}
          {userBalance !== undefined ? (
            <text>Your PURSE: {userBalance.toLocaleString()} PURSE</text>
          ) : null}
          {maxMint !== undefined ? (
            <text>
              You can mint:{" "}
              {(availableTokens
                ? Math.min(maxMint, availableTokens)
                : maxMint
              ).toLocaleString()}{" "}
              PURSEBOX
            </text>
          ) : null}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "right",
            }}
          >
            <text>{mintAmount} PURSEBOX =</text>
            {mintingCost !== undefined ? (
              <text>
                {FormatBigIntToString({
                  bigInt: mintingCost,
                  multiplier: mintAmount,
                  decimalPlaces: 3,
                  suffix: " ETH + ",
                })}
              </text>
            ) : null}
            {purseRatio !== undefined ? (
              <text>
                {FormatBigIntToString({
                  bigInt: purseRatio,
                  multiplier: mintAmount,
                  decimalPlaces: 3,
                  suffix: " PURSE",
                })}
              </text>
            ) : null}
            <div className="col-auto">
              <input
                style={{ width: "75%" }}
                type="number"
                min="0"
                value={mintAmount}
                onChange={handleInputChange}
                placeholder="1"
              />
              <Button
                variant="outline-primary"
                style={{
                  height: "100%",
                  color: "#ba00ff",
                }}
                onClick={() =>
                  setMintAmount(
                    availableTokens
                      ? Math.min(maxMint, availableTokens)
                      : maxMint
                  )
                }
              >
                Max
              </Button>
            </div>
          </div>
          <Button
            disabled={mintAmount == 0}
            style={{ backgroundColor: "#ba00ff", padding: "1% 20%" }}
            onClick={handleMint}
          >
            Mint
          </Button>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default function PurseBox() {
  const renderWeb = () => {
    return (
      <div style={{ margin: "0 auto", maxWidth: "1000px" }}>
        <div className="my-4">
          {/*<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>*/}
          <div className="center img">
            {" "}
            {/*className="left img" style={{marginRight: '20px'}}*/}
            <img src={purple} height="180" alt="" />
          </div>
          <label
            className="textWhite center"
            style={{ fontSize: "40px", textAlign: "center" }}
          >
            <big>
              <text>PURSE BOX</text>
            </big>
          </label>
          {/*</div>*/}
          <div className="textMedium pt-4">
            <big>
              <span className="textWhiteMedium">PURSE</span> adopts the
              experimental <span className="textWhiteMedium">ERC404</span>,
              merging <span className="textWhiteMedium">ERC20</span> and{" "}
              <span className="textWhiteMedium">ERC721</span> features. This
              innovation offers a user "
              <span className="textWhiteMedium">option</span>" switch for
              transitioning between token types, mitigating high fees and
              enhancing exchange integration. This step signifies{" "}
              <span className="textWhiteMedium">PURSE</span>'s commitment to
              broadening digital asset utility and innovation.
            </big>
          </div>
          <div className="textWhiteSmall pt-4">
            <p>Sample PURSE404 NFTs:</p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="center img">
              <img src={red} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={green} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={blue} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={orange} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={purple} height="135" alt="" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMobile = () => {
    return (
      <div style={{ margin: "0 auto", maxWidth: "300px" }}>
        <div id="content" className="mt-4">
          {/*<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>*/}
          <div className="center img">
            {" "}
            {/*className="left img" style={{marginRight: '20px'}}*/}
            <img src={purple} height="180" alt="" />
          </div>
          <label
            className="textWhite center"
            style={{ fontSize: "40px", textAlign: "center" }}
          >
            <big>
              <text>PURSE BOX</text>
            </big>
          </label>
          <div className="textMedium pt-4">
            <big>
              <span className="textWhiteMedium">PURSE</span> adopts the
              experimental <span className="textWhiteMedium">ERC404</span>,
              merging <span className="textWhiteMedium">ERC20</span> and{" "}
              <span className="textWhiteMedium">ERC721</span> features. This
              innovation offers a user "
              <span className="textWhiteMedium">option</span>" switch for
              transitioning between token types, mitigating high fees and
              enhancing exchange integration. This step signifies{" "}
              <span className="textWhiteMedium">PURSE</span>'s commitment to
              broadening digital asset utility and innovation.
            </big>
          </div>
          <div className="textWhiteSmall pt-4">
            <p>Sample PURSE404 NFTs:</p>
          </div>
          <div
            style={{
              display: "block",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="center img">
              <img src={red} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={green} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={blue} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={orange} height="135" alt="" />
            </div>
            <div className="center img">
              <img src={purple} height="135" alt="" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <MediaQuery minWidth={601}>{renderWeb()}</MediaQuery>
      <MediaQuery maxWidth={600}>{renderMobile()}</MediaQuery>
      <MintContainer />
    </div>
  );
}
