import { MetaMask } from "@web3-react/metamask";
import { WalletConnect } from "@web3-react/walletconnect-v2";
import type { Connector } from "@web3-react/types";
import PurseFarm from "../farm/farmPurse.json";
import { BigNumber, Signer, ethers } from "ethers";
import { formatUnits, solidityPack } from "ethers/lib/utils";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import UserAmount from "../abis/userAmount.json";

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return "MetaMask";
  else if (connector instanceof WalletConnect) return "WalletConnectV2";
  return "Unknown";
}

export function getShortAccount(account: string | undefined) {
  if (!account) {
    return "";
  }
  const first4Account = account.substring(0, 4);
  const last4Account = account.slice(-4);
  const _shortAccount = first4Account + "..." + last4Account;
  return _shortAccount;
}

export function getShortTxHash(txHash: string | undefined) {
  if (!txHash) {
    return "";
  }
  const first5 = txHash.substring(0, 5);
  const last5 = txHash.slice(-5);
  const _short = first5 + "...." + last5;
  return _short;
}

export function chainId2NetworkName(chainId: number) {
  if (chainId === 97) {
    return "BSC Testnet";
  } else if (chainId === 56) {
    return "BSC";
  } else if (chainId === 1) {
    return "Ethereum";
  } else if (chainId === 3) {
    return "Ropsten";
  } else if (chainId === 4) {
    return "Rinkeby";
  } else if (chainId === 42) {
    return "Kovan";
  } else if (chainId === 137) {
    return "Polygon";
  } else if (chainId === 80001) {
    return "Mumbai";
  } else if (chainId === 43113) {
    return "Fuji";
  } else if (chainId === 43114) {
    return "Avalanche";
  } else {
    return "NaN";
  }
}

export function convertUnixToDate(UnixTimestamp: number | string) {
  return convertUnixToDateTime(UnixTimestamp, false);
}

export function convertUnixToDateTime(
  UNIX_timestamp: number | string,
  showTime?: boolean
) {
  let numTimestamp =
    typeof UNIX_timestamp == "string"
      ? parseInt(UNIX_timestamp as string, 10)
      : UNIX_timestamp;
  const a = new Date(numTimestamp * 1000);

  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var dateTime = date + " " + month + " " + year;
  if (!showTime) {
    return dateTime;
  }

  var hour = a
    .getHours()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  var min = a
    .getMinutes()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  var sec = a
    .getSeconds()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  return dateTime + " " + hour + ":" + min + ":" + sec;
}

export function secondsToDhms(lockPeriod: number, remainingTime: number) {
  remainingTime = lockPeriod - Number(remainingTime);
  let d = Math.floor(remainingTime / (3600 * 24));
  let h = Math.floor((remainingTime % (3600 * 24)) / 3600);
  let m = Math.floor((remainingTime % 3600) / 60);

  let dDisplay = d > 0 ? d + "d " : "";
  let hDisplay = h > 0 ? h + "h " : "";
  let mDisplay = m > 0 ? m + "m " : "";
  return remainingTime > 60 ? dDisplay + hDisplay + mDisplay : "< 1m";
}

export function getPoolSegmentInfo(_poolLength: number) {
  const farm = PurseFarm.farm;
  let n = 0;
  let _poolSegmentInfo: any[any] = [[], []];
  for (let i = 0; i < _poolLength; i++) {
    let poolInfo = farm[i];
    if (poolInfo.lpTokenPairsymbol === "Cake-LP") {
      _poolSegmentInfo[0][n] = poolInfo;
      n += 1;
    } else {
      _poolSegmentInfo[1][n] = poolInfo;
      n += 1;
    }
  }
}

export async function readContract(
  contract: ethers.Contract,
  method: string,
  ...args: any[]
) {
  try {
    const result = await contract[method](...args);
    return result;
  } catch (err) {
    // console.log(err)
    return null;
  }
}

export function formatBigNumber(bignumber: any, units: string) {
  // if (!bignumber)
  if (bignumber && ethers.BigNumber.isBigNumber(bignumber)) {
    return formatUnits(bignumber, units);
  } else {
    return "0";
  }
}

export function isSupportedChain(chainId: number | undefined) {
  const supportedChains = [1, 11155111, 56, 97];
  return chainId && supportedChains.includes(chainId);
}

export async function callContract(
  signer: Signer | undefined,
  contract: ethers.Contract | null,
  method: string,
  ...args: any[]
) {
  try {
    await contract?.connect(signer!).callStatic[method](...args);
    const tx = await contract?.connect(signer!)[method](...args);
    return tx;
  } catch (err: any) {
    console.log(err?.reason);
    return err;
  }
}

export const fetcher = (library: any) => (args: any) => {
  const { method, params } = args;
  return library[method](...params);
};

export const RawDataFormatter = (number: number) => {
  return DataFormater(Math.round(number / 10 ** 18));
};

export const DataFormater = (number: number) => {
  if (number > 1000000000) {
    return Math.round(number / 1000000000).toString() + "B";
  } else if (number > 1000000) {
    return Math.round(number / 1000000).toString() + "M";
  } else if (number > 1000) {
    return Math.round(number / 1000).toString() + "K";
  } else {
    return number.toString();
  }
};

export const RawNumberFormatter = (number: number) => {
  return NumberFormatter(Math.round(number / 10 ** 18));
};

export const NumberFormatter = (number: number) => {
  return number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
};

export const FormatNumberToString = ({
  bigNum,
  units = "ether",
  locale = "en-US",
  multiplier = 1,
  decimalPlaces,
  prefix = "",
  suffix = "",
}: {
  bigNum: BigNumber;
  decimalPlaces: number;
  units?: string;
  locale?: string;
  multiplier?: number;
  prefix?: string;
  suffix?: string;
}) => {
  if (!bigNum) {
    return;
  }
  if (BigNumber.from(0).eq(bigNum)) {
    return prefix + "0" + suffix;
  }
  let resString = (
    parseFloat(formatBigNumber(bigNum, units)) * multiplier
  ).toLocaleString(locale, {
    maximumFractionDigits: decimalPlaces,
  });
  if (resString === "0") {
    resString = `< ${1 / 10 ** decimalPlaces}`;
  }
  return prefix + resString + suffix;
};

export const FormatBigIntToString = ({
  bigInt,
  units = "ether",
  locale = "en-US",
  multiplier = 1,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
}: {
  bigInt: bigint;
  decimalPlaces?: number;
  units?: string;
  locale?: string;
  multiplier?: number;
  prefix?: string;
  suffix?: string;
}) => {
  let resString = (
    Number(ethers.utils.formatUnits(bigInt, units)) * multiplier
  ).toLocaleString(locale, {
    maximumFractionDigits: decimalPlaces,
  });
  return prefix + resString + suffix;
};

// turns 0x123456789abcd => 0x1234 ... abcd
export const formatShortenAddress = (
  fullAddr: string | undefined,
  head = 7,
  tail = 4
) => {
  if (!fullAddr || fullAddr.length < 10 || head < 0 || tail < 0) {
    return fullAddr;
  }
  const strLen = fullAddr.length;
  return `${fullAddr.slice(0, head)} ... ${fullAddr.slice(strLen - tail)}`;
};

export const capitalizeString = (str: string | undefined) => {
  if (!str) return undefined;
  if (str.length === 0) return str;
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};

export const getMerkleProof = async (account: string) => {
  const keys = Object.keys(UserAmount);
  const values = Object.values(UserAmount);
  const balances: { address: string; amount: any }[] = [];
  let address: string;
  let amount: string;
  for (let i = 0; i < keys.length; i++) {
    address = keys[i];
    amount = values[i]["Amount"];
    if (parseFloat(amount) !== 0) {
      balances.push({
        address: address,
        amount: solidityPack(["uint256"], [amount]),
      });
    }
  }
  const newValues = Object.values(balances);
  const array: { address: string; id: number }[] = [];
  for (let i = 0; i < Object.keys(balances).length; i++) {
    address = newValues[i]["address"];
    amount = values[i]["Amount"];
    array.push({
      address: newValues[i]["address"],
      id: i,
    });
  }
  const index = Object.assign({}, ...array.map((x) => ({ [x.address]: x.id })));
  const leafNodes = balances.map((balance) =>
    keccak256(
      Buffer.concat([
        Buffer.from(balance.address.replace("0x", ""), "hex"),
        Buffer.from(balance.amount.replace("0x", ""), "hex"),
      ])
    )
  );
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const merkleProof = merkleTree.getHexProof(leafNodes[index[account]]);
  return merkleProof;
};

export const getMerkleProofUserAmount = async (
  account: string,
  UserAmount: object
) => {
  const keys = Object.keys(UserAmount);
  const values = Object.values(UserAmount);
  const balances: { address: string; amount: any }[] = [];
  let address: string;
  let amount: string;
  for (let i = 0; i < keys.length; i++) {
    address = keys[i];
    amount = values[i]["Amount"];
    if (parseFloat(amount) !== 0) {
      balances.push({
        address: address,
        amount: solidityPack(["uint256"], [amount]),
      });
    }
  }
  const newValues = Object.values(balances);
  const array: { address: string; id: number }[] = [];
  for (let i = 0; i < Object.keys(balances).length; i++) {
    address = newValues[i]["address"];
    amount = values[i]["Amount"];
    array.push({
      address: newValues[i]["address"],
      id: i,
    });
  }
  const index = Object.assign({}, ...array.map((x) => ({ [x.address]: x.id })));
  const leafNodes = balances.map((balance) =>
    keccak256(
      Buffer.concat([
        Buffer.from(balance.address.replace("0x", ""), "hex"),
        Buffer.from(balance.amount.replace("0x", ""), "hex"),
      ])
    )
  );
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const merkleProof = merkleTree.getHexProof(leafNodes[index[account]]);
  return merkleProof;
};

export const isUserInList = (
  account: string | undefined,
  userAmount: object
) => {
  if (account) return Object.keys(userAmount).includes(account);
  return false;
};
