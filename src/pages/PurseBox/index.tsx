import React, { useEffect, useRef, useState } from "react";
import MediaQuery from "react-responsive";
import red from "../../assets/images/red.png";
import blue from "../../assets/images/blue.png";
import green from "../../assets/images/green.png";
import orange from "../../assets/images/orange.png";
import { Loading } from "../../components/Loading";
import purple from "../../assets/images/purple.png";
import { useWeb3React } from "@web3-react/core";
import Button from "react-bootstrap/esm/Button";
import { Popup as ReactPopup } from "reactjs-popup";
import { BsInfoCircleFill } from "react-icons/bs";
import { useProvider } from "../../components/state/provider/hooks";
import { useNetwork } from "../../components/state/network/hooks";
import { useContract } from "../../components/state/contract/hooks";
import { useToast } from "../../components/state/toast/hooks";

import * as Constants from "../../constants";
import { useWalletTrigger } from "../../components/state/walletTrigger/hooks";
import {
  FormatBigIntToString,
  callContract,
  formatShortenAddress,
  getShortTxHash,
} from "../../components/utils";
import { CopyIcon } from "../../components/Icons/Icons";

type NFTMeta = {
  id: bigint;
  color: string;
  image: string;
};

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
  const [userInactiveBalance, setUserInactiveBalance] = useState<bigint>();
  const [numUserTokens, setNumUserTokens] = useState<number>(0);
  const [mintAmount, setMintAmount] = useState<number>(1);
  const [maxMint, setMaxMint] = useState<number>(0);
  const [availableTokens, setAvailableTokens] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isTokenMetaLoading, setIsTokenMetaLoading] = useState<boolean>(true);
  const [tokenMeta, setTokenMeta] = useState<NFTMeta[]>([]);

  const fetchTokenMeta = (tokenIds: bigint[]) => {
    setIsTokenMetaLoading(true);
    Promise.all(
      tokenIds.map(async (tokenId) => {
        return await fetch(
          `https://raw.githubusercontent.com/pundix/purse-box/main/metadata/${tokenId.toString()}`,
          {
            method: "GET",
            cache: "force-cache",
          }
        )
          .then((raw) => raw.json())
          .then((json) => {
            return {
              id: tokenId,
              color: json.attributes[0].value,
              image: json.image.split("ipfs://").slice(-1),
            } as NFTMeta;
          });
      })
    ).then((jsonArray) => {
      setTokenMeta(jsonArray);
      setIsTokenMetaLoading(false);
    });
  };

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
        .inactiveBalance(account)
        .then((userInactiveBalance: bigint) =>
          setUserInactiveBalance(userInactiveBalance)
        ),
      purseToken404UpgradableEth.owned(account).then((userTokens: bigint[]) => {
        fetchTokenMeta(userTokens);
        setNumUserTokens(userTokens.length);
      }),
      purseToken404UpgradableEth
        .units()
        .then((purseRatio: bigint) => setPurseRatio(purseRatio)),
      purseToken404UpgradableEth.mintingCost().then((res: bigint) => {
        if (res !== undefined) setMintingCost(res);
      }),
    ]).then(() => setIsLoading(false));
  }, [account, isTargetChainMatch, purseToken404UpgradableEth]);

  useEffect(() => {
    if (!(userInactiveBalance !== undefined && purseRatio !== undefined))
      return;
    const maxMint = Math.floor(Number(userInactiveBalance / purseRatio));
    setMaxMint(
      availableTokens !== undefined
        ? Math.min(maxMint, availableTokens)
        : maxMint
    );
  }, [userInactiveBalance, purseRatio, availableTokens]);

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
        await tx.wait();
        if (refresh !== undefined) {
          refresh();
        }
        setIsLoading(false);
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
      setIsLoading(false);
      showToast("Something went wrong.", "failure");
      console.log(err);
      return false;
    }
    return false;
  };

  const handleRefreshAfterMint = async () => {
    await Promise.all([
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
        .erc721BalanceOf(account)
        .then((userTokens: bigint[]) => {
          fetchTokenMeta(userTokens);
          setNumUserTokens(userTokens.length);
        }),
      purseToken404UpgradableEth
        .inactiveBalance(account)
        .then((userInactiveBalance: bigint) =>
          setUserInactiveBalance(userInactiveBalance)
        ),
      purseToken404UpgradableEth
        .balanceOf(account)
        .then((userBalance: bigint) => setUserBalance(userBalance)),
    ]);
  };

  const handleMint = async () => {
    if (!purseToken404UpgradableEth) {
      return;
    }
    if (!mintingCost) {
      const mintCost: bigint = await purseToken404UpgradableEth.mintingCost();
      if (!mintCost) return;
      setMintingCost(mintCost);
    }
    const etherCost: bigint = BigInt(mintingCost!) * BigInt(mintAmount);
    await handleTxResponse(
      callContract(
        signer,
        purseToken404UpgradableEth,
        "mintERC721",
        mintAmount,
        {
          value: etherCost,
        }
      ),
      handleRefreshAfterMint
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
    <>
      <div
        className="card cardbody"
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "0 auto",
          padding: "1%",
          width: "50%",
          minWidth: "430px",
          maxWidth: "565px",
          border: "2px inset grey",
          borderRadius: "10px",
        }}
      >
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "2%",
              }}
            >
              <div style={{ display: "flex" }}>
                <text style={{ marginRight: "auto" }}>Total NFTs: </text>
                <text>{Number(10000).toLocaleString()} PURSEBOX</text>
              </div>
              {availableTokens !== undefined ? (
                <div style={{ display: "flex" }}>
                  <text style={{ marginRight: "auto" }}>NFTs Available: </text>
                  <text>{availableTokens.toLocaleString()} PURSEBOX</text>
                </div>
              ) : null}
              <div style={{ display: "flex" }}>
                <text style={{ marginRight: "auto" }}>Your NFTs: </text>
                <text>{Number(numUserTokens).toLocaleString()} PURSEBOX</text>
              </div>
              {userBalance !== undefined ? (
                <div style={{ display: "flex" }}>
                  <div style={{ marginRight: "auto" }}>
                    <text>Your $PURSE Tokens: </text>
                    {numUserTokens > 0 ? (
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
                        <text className="textInfo">{`${FormatBigIntToString({
                          bigInt: userBalance,
                        })} Total $PURSE = \
                        ${(
                          numUserTokens ?? 0
                        ).toLocaleString()} PURSEBOX + ${FormatBigIntToString({
                          bigInt: userInactiveBalance ?? BigInt(0),
                        })} $PURSE`}</text>
                      </ReactPopup>
                    ) : null}
                  </div>
                  <text>
                    {FormatBigIntToString({
                      bigInt: userBalance,
                      decimalPlaces: 3,
                      suffix: " $PURSE",
                    })}
                  </text>
                </div>
              ) : null}
              {maxMint !== undefined ? (
                <div style={{ display: "flex" }}>
                  <text style={{ marginRight: "auto" }}>You can mint: </text>
                  <text>
                    {(availableTokens
                      ? Math.min(maxMint, availableTokens)
                      : maxMint
                    ).toLocaleString()}{" "}
                    PURSEBOX
                  </text>
                </div>
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "right",
              }}
            >
              <text>
                {mintAmount} PURSEBOX ={" "}
                {mintingCost !== undefined
                  ? FormatBigIntToString({
                      bigInt: mintingCost,
                      multiplier: mintAmount,
                      decimalPlaces: 4,
                      suffix: " ETH + ",
                    })
                  : `${(0.01).toLocaleString()} ETH + `}
                {purseRatio !== undefined
                  ? FormatBigIntToString({
                      bigInt: purseRatio,
                      multiplier: mintAmount,
                      decimalPlaces: 3,
                      suffix: " $PURSE",
                    })
                  : `${Number(1000000).toLocaleString()} $PURSE`}
              </text>
            </div>
            <div style={{ margin: "1% 0" }}>
              <input
                style={{ width: "85%", verticalAlign: "middle" }}
                type="number"
                min="0"
                value={mintAmount}
                onChange={handleInputChange}
                placeholder="1"
              />
              <Button
                variant="outline-primary"
                style={{
                  width: "15%",
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
            <Button
              disabled={mintAmount === 0}
              style={{ backgroundColor: "#ba00ff" }}
              onClick={handleMint}
            >
              Mint
            </Button>
          </>
        ) : (
          <div style={{ margin: "10% auto" }}>
            <Loading />
          </div>
        )}
      </div>
      {!isTokenMetaLoading ? (
        <div
          className="card cardbody"
          style={{
            display: "flex",
            margin: "3% auto 0 auto",
            padding: "1%",
            width: "50%",
            minWidth: "430px",
            maxWidth: "565px",
            border: "1px inset grey",
          }}
        >
          <p
            style={{
              textAlign: "center",
              fontSize: "25px",
              fontWeight: "bold",
              margin: "2% 0 4% 0",
            }}
          >
            Your NFTs
          </p>
          <ol style={{ listStyleType: "decimal" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: "2%",
                verticalAlign: "middle",
                fontSize: "20px",
              }}
            >
              <div style={{ paddingLeft: "5%", marginRight: "25%" }}>
                NFT ID
              </div>
              <div>Color Trait</div>
              <div
                style={{
                  paddingRight: "5%",
                  marginLeft: "auto",
                  textAlign: "right",
                  width: "20%",
                }}
              >
                Preview
              </div>
            </div>
            {tokenMeta.map((token) => (
              <li>
                <div
                  style={{
                    display: "flex",
                    paddingRight: "9%",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ marginRight: "25%" }}>
                    <text>
                      {formatShortenAddress(token.id.toLocaleString(), 4, 4)}
                    </text>
                    <button
                      style={{
                        border: "none",
                        color: "light-grey",
                        backgroundColor: "transparent",
                        translate: "-3px -5px",
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(token.toLocaleString());
                        showToast("Token ID copied to clipboard", "success");
                      }}
                    >
                      <CopyIcon />
                    </button>
                  </div>
                  <text>{token.color}</text>
                  <img
                    alt=""
                    height="35px"
                    style={{ translate: "0 -7px", marginLeft: "auto" }}
                    src={`https://gateway.ipfs.io/ipfs/${token.image}`}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </>
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
          <div className="textMedium py-4">
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
          <div className="textMedium py-4">
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
