import React, { useState, useEffect } from "react";
import MediaQuery from "react-responsive";
import { IoStar } from "react-icons/io5";
import { BigNumber } from "ethers";
import * as Constants from "../../constants";
import { Loading } from "../Loading";
import { useContract } from "../state/contract/hooks";
import { formatBigNumber } from "../utils";

export default function FarmDashboard() {
  const { purseTokenUpgradable, restakingFarm } = useContract();

  const [totalRewardPerBlock, setTotalRewardPerBlock] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [poolLength, setPoolLength] = useState<number>(0);
  const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [poolCapRewardToken, setPoolCapRewardToken] = useState("0");
  const [poolMintedRewardToken, setPoolMintedRewardToken] = useState("0");
  const [poolRewardToken, setPoolRewardToken] = useState("0");
  const [isFetchFarmDataLoading, setIsFetchFarmDataLoading] = useState(true);

  useEffect(() => {
    console.log(`start: ${Date.now()}`);
    async function loadData() {
      await Promise.all([
        purseTokenUpgradable
          ._totalSupply()
          .then((res: BigNumber) => setPurseTokenTotalSupply(res)),
        restakingFarm.poolLength().then(async (resp: any) => {
          const poolLength = parseFloat(resp.toString());
          setPoolLength(poolLength);
          let _totalRewardPerBlock: BigNumber = BigNumber.from("0");
          return Promise.all(
            Array.from(Array(poolLength).keys()).map((i) => {
              return restakingFarm.poolTokenList(i).then((address: any) => {
                return restakingFarm
                  .poolInfo(address.toString())
                  .then((info: any) => {
                    _totalRewardPerBlock = _totalRewardPerBlock.add(
                      info.pursePerBlock?.mul(info.bonusMultiplier)
                    );
                  });
              });
            })
          ).then(() => setTotalRewardPerBlock(_totalRewardPerBlock));
        }),
        restakingFarm.capMintToken().then((tokenCap: any) => {
          setPoolCapRewardToken(tokenCap);
        }),
        restakingFarm.totalMintToken().then((tokenTotal: any) => {
          setPoolMintedRewardToken(tokenTotal);
        }),
        purseTokenUpgradable
          .balanceOf(Constants.RESTAKING_FARM_ADDRESS)
          .then((tokenBalance: any) => {
            setPoolRewardToken(tokenBalance);
          }),
      ]).then(() => {
        setIsFetchFarmDataLoading(false);
        console.log(`end: ${Date.now()}`);
      });
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purseTokenUpgradable, restakingFarm]);

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
              {isFetchFarmDataLoading ? (
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
              )}
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
              {isFetchFarmDataLoading ? (
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
              )}
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
              {isFetchFarmDataLoading ? (
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

  const renderFarmRemarks = () => {
    return (
      <div
        style={{
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

  return (
    <>
      <MediaQuery minWidth={601}>{renderFullFarmTable()}</MediaQuery>
      <MediaQuery maxWidth={600}>{renderNarrowFarmTable()}</MediaQuery>
      {renderFarmRemarks()}
    </>
  );
}
