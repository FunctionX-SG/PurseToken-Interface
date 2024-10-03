import type { AddEthereumChainParameter } from "@web3-react/types";
import * as Constants from "../constants";

interface BasicChainInformation {
  urls: string[];
  name: string;
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter["nativeCurrency"];
  blockExplorerUrls: AddEthereumChainParameter["blockExplorerUrls"];
}

type ChainConfig = { [chainId: number]: ExtendedChainInformation };

const ETH: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
};

const SepoliaETH: AddEthereumChainParameter["nativeCurrency"] = {
  name: "SepoliaETH",
  symbol: "SepoliaETH",
  decimals: 18,
};

const MATIC: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Matic",
  symbol: "MATIC",
  decimals: 18,
};

const CELO: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Celo",
  symbol: "CELO",
  decimals: 18,
};

const BNB: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Binance Coin",
  symbol: "BNB",
  decimals: 18,
};

const TBNB: AddEthereumChainParameter["nativeCurrency"] = {
  name: "Binance Coin",
  symbol: "TBNB",
  decimals: 18,
};

export const MAINNET_CHAINS: ChainConfig = {
  1: {
    urls: [Constants.ETH_MAINNET_RPCURL].filter(Boolean),
    name: "ETH",
    blockExplorerUrls: [Constants.ETH_MAINNET_BLOCKEXPLORER],
    nativeCurrency: ETH,
  },
  56: {
    urls: [Constants.BSC_MAINNET_RPCURL, Constants.BSC_MAINNET_RPCURL_1].filter(
      Boolean
    ),
    name: "BSC",
    blockExplorerUrls: [Constants.BSC_MAINNET_BLOCKEXPLORER],
    nativeCurrency: BNB,
  },
  11155111: {
    urls: [Constants.ETH_TESTNET_RPCURL_SEPOLIA].filter(Boolean),
    name: "SEPOLIA",
    blockExplorerUrls: [Constants.ETH_TESTNET_BLOCKEXPLORER_SEPOLIA],
    nativeCurrency: SepoliaETH,
  },
  97: {
    urls: [
      Constants.BSC_TESTNET_RPC_URL_S2,
      Constants.BSC_TESTNET_RPC_URL_S3,
    ].filter(Boolean),
    name: "BSC Testnet",
    blockExplorerUrls: [Constants.BSC_TESTNET_BLOCKEXPLORER],
    nativeCurrency: TBNB,
  },
  137: {
    urls: ["url3", "https://polygon-rpc.com"].filter(Boolean),
    name: "Polygon Mainnet",
    nativeCurrency: MATIC,
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  42220: {
    urls: ["url4", "https://forno.celo.org"],
    name: "Celo",
    nativeCurrency: CELO,
    blockExplorerUrls: ["https://explorer.celo.org"],
  },
};

export function getChainInfo(chainId: number) {
  return MAINNET_CHAINS[chainId];
}
