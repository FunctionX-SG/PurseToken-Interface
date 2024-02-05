import React, { useState, useEffect } from "react";
import { BigNumber } from "ethers";
import * as Constants from "../../constants";
import { Loading } from "../Loading";
import { useContract } from "../state/contract/hooks";
import {
  formatDisplayedBigNumber,
  getISOStringWithoutSecsAndMillisecs,
  isSupportedChain,
} from "../utils";
import { useWeb3React } from "@web3-react/core";
import { formatUnits } from "ethers/lib/utils";
import { useNetwork } from "../state/network/hooks";
import { useWalletTrigger } from "../state/walletTrigger/hooks";

type VestingSchedule = {
  startTime: BigNumber;
  endTime: BigNumber;
  quantity: BigNumber;
  vestedQuantity: BigNumber;
};

const DashboardField = (props: {
  field: string;
  value: string;
  isLoading?: boolean;
}) => {
  const { field, value, isLoading } = props;
  return (
    <>
      <div className="textWhiteSmall mb-1" style={{ fontFamily: "arial" }}>
        <b>{`${field}: `}</b>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="textWhiteSmall mb-2" style={{ color: "#000" }}>
          <b>{value}</b>
        </div>
      )}
    </>
  );
};

export default function VaultDashboard() {
  const { purseStaking, stakePurseVault, stakePurseVaultVesting } =
    useContract();
  const { account, chainId, isActive } = useWeb3React();
  const [, switchNetwork] = useNetwork();
  const [, setTrigger] = useWalletTrigger();

  // user data
  const [userTotalShares, setUserTotalShares] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [userClaimableReward, setUserClaimableReward] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [userVestingSchedules, setUserVestingSchedules] = useState<
    VestingSchedule[]
  >([]);
  const [isFetchVaultUserDataLoading, setIsFetchVaultUserDataLoading] =
    useState(false);

  // vault data
  const [vaultAssetsTotal, setVaultAssetsTotal] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [vaultSharesTotal, setVaultSharesTotal] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [vaultCompoundPending, setVaultCompoundPending] = useState<BigNumber>(
    BigNumber.from("0")
  );
  const [isFetchVaultDataLoading, setIsFetchVaultDataLoading] = useState(true);

  const showUserVaultInformation = isActive && isSupportedChain(chainId);

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        stakePurseVault
          .totalAssets()
          .then((resp: BigNumber) => setVaultAssetsTotal(resp)),
        stakePurseVault
          .totalSupply()
          .then((resp: BigNumber) => setVaultSharesTotal(resp)),
        purseStaking
          .previewClaimableRewards(Constants.STAKE_PURSE_VAULT_ADDRESS)
          .then((resp: BigNumber) => setVaultCompoundPending(resp)),
      ]).then(() => {
        setIsFetchVaultDataLoading(false);
      });
    }
    loadData();
  }, [purseStaking, stakePurseVault]);

  useEffect(() => {
    if (!(isActive && account)) {
      return;
    }
    setIsFetchVaultUserDataLoading(true);
    async function loadData() {
      await Promise.all([
        stakePurseVault
          .balanceOf(account)
          .then((resp: BigNumber) => setUserTotalShares(resp)),
        stakePurseVault
          .claimable(account)
          .then((resp: BigNumber) => setUserClaimableReward(resp)),
        stakePurseVaultVesting
          .getVestingSchedules(account)
          .then((resp: VestingSchedule[]) => setUserVestingSchedules(resp)),
      ]).then(() => {
        setIsFetchVaultUserDataLoading(false);
      });
    }
    loadData();
  }, [account, isActive, stakePurseVault, stakePurseVaultVesting]);

  const renderVestingScheduleTable = () => {
    return (
      <div style={{ marginBottom: "2.5%" }}>
        <div className="row center" style={{ fontWeight: "900" }}>
          <div
            className="ml-2 mr-2 mb-1 mt-1"
            style={{
              backgroundColor: "#ba00ff",
              color: "white",
              paddingTop: "4px",
              paddingBottom: "4px",
              width: "57%",
              textAlign: "center",
              fontSize: "16px",
            }}
          >
            Your pending Vault withdrawal requests
          </div>
        </div>
        <div className="row center" style={{ fontWeight: "bold" }}>
          <div
            className="ml-2 mr-2 mb-1"
            style={{
              width: "20%",
              flexGrow: "0",
              textAlign: "left",
              fontSize: "15px",
            }}
          >
            Amount
          </div>
          <div
            className="ml-2 mr-2 mb-1"
            style={{
              width: "20%",
              textAlign: "left",
              fontSize: "15px",
            }}
          >
            Completion Time
          </div>
          <div
            className="ml-2 mr-2 mb-1"
            style={{
              width: "12%",
              textAlign: "right",
              fontSize: "15px",
            }}
          >
            Status
          </div>
        </div>
        {userVestingSchedules.map(
          (vestingData: VestingSchedule, index: number) => {
            return (
              <div key={index} className="row center">
                <div
                  className="ml-2 mr-2"
                  style={{
                    width: "20%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  {`${formatDisplayedBigNumber(
                    vestingData.quantity,
                    "ether"
                  )} PURSE`}
                </div>
                <div
                  className="ml-2 mr-2"
                  style={{
                    width: "20%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  {getISOStringWithoutSecsAndMillisecs(
                    vestingData.endTime as any
                  )}
                </div>
                <div
                  className="ml-2 mr-2"
                  style={{
                    width: "12%",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                >
                  {vestingData.endTime.toNumber() > Date.now() / 1000 ? (
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
          }
        )}
      </div>
    );
  };

  return (
    <div className="card mb-2 cardbody">
      <div className="card-body center">
        <div
          style={{
            borderRight: "1px solid black",
            width: "47.5%",
            marginRight: "2.5%",
            minWidth: "250px",
            paddingRight: "2.5%",
          }}
        >
          <DashboardField
            field={"Vault Assets"}
            value={`${parseFloat(
              formatUnits(vaultAssetsTotal, "ether")
            ).toLocaleString("en-US", {
              maximumFractionDigits: 3,
            })} PURSE`}
            isLoading={isFetchVaultDataLoading}
          />
          <DashboardField
            field={"Vault Shares"}
            value={`${parseFloat(
              formatUnits(vaultSharesTotal, "ether")
            ).toLocaleString("en-US", {
              maximumFractionDigits: 3,
            })} StPURSE`}
            isLoading={isFetchVaultDataLoading}
          />
          <DashboardField
            field={"Pending Compounding Amount"}
            value={`${parseFloat(
              formatUnits(vaultCompoundPending, "ether")
            ).toLocaleString("en-US", {
              maximumFractionDigits: 3,
            })} PURSE`}
            isLoading={isFetchVaultDataLoading}
          />
        </div>
        {showUserVaultInformation ? (
          <>
            <div
              style={{
                width: "50%",
                minWidth: "250px",
                paddingRight: "2.5%",
              }}
            >
              <DashboardField
                field={"Your Vault Shares"}
                value={`${formatDisplayedBigNumber(
                  userTotalShares,
                  "ether"
                )} StPURSE`}
                isLoading={isFetchVaultUserDataLoading}
              />
              <DashboardField
                field={"Your Claimable Rewards"}
                value={`${formatDisplayedBigNumber(
                  userTotalShares,
                  "ether"
                )} BAVA`}
                isLoading={isFetchVaultUserDataLoading}
              />
            </div>
          </>
        ) : (
          <div className="center">
            <div
              className="card cardbody"
              style={{
                color: "White",
              }}
            >
              <div className="card-body">
                <div>
                  <div
                    className="center textWhiteMedium mt-3 mb-3"
                    style={{ textAlign: "center" }}
                  >
                    <b>{`${
                      isActive ? "Switch network " : "Connect wallet"
                    } to view your vault information`}</b>
                  </div>
                  <div className="center">
                    <button
                      type="button"
                      className="btn btn-primary mt-3"
                      onClick={() =>
                        isActive ? switchNetwork() : setTrigger(true)
                      }
                    >
                      {isActive ? "Switch" : "Connect"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showUserVaultInformation ? renderVestingScheduleTable() : null}
    </div>
  );
}
