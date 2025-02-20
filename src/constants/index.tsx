//BSC mainnet: 56, testnet: 97
export const BSC_CHAIN_ID = 56;

export const ETH_CHAIN_ID = 1;

//Contract Addresses
// bsc
export const PURSE_BUSD_PAIR_ADDRESS =
  "0x081F4B87F223621B4B31cB7A727BB583586eAD98";
export const PURSE_USDT_PAIR_ADDRESS =
  "0xfc450e16016aF4e4197f5dB5Ca0d262fF8fD735a";
export const PURSE_TOKEN_UPGRADABLE_ADDRESS =
  "0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C";
export const RESTAKING_FARM_ADDRESS =
  "0x439ec8159740a9b9a579f286963ac1c050af31c8";
export const PURSE_STAKING_ADDRESS =
  "0xFb1D31a3f51Fb9422c187492D8EA14921d6ea6aE";
export const PURSE_STAKING_VESTING_ADDRESS =
  "0x4131CF7A6B59510BF969eECaFc2730cE3371486d";
export const TREASURY_ADDRESS = "0x6935a78b5ff92435662FB365085e5E490cC032C5";
export const RETROACTIVE_REWARDS_ADDRESS =
  "0x092EdD5aD8f9bd8Fd3D97b94DC88E129D440B599";
export const REWARD_DISTRIBUTOR_ADDRESS =
  "0x1b6d1D232c35F3534EDeB9A989DB62831Ff87A40";
export const REWARD_ADDRESS = "0x50c643a188Ab7471dF9943E5Efb4949ac4cD4092";
// fx
export const FIP20UPGRADABLE_ADDRESS =
  "0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687";
export const MASTERCHEFV2_ADDRESS =
  "0x4bd522b2E25f6b1A874C78518EF25f5914C522dC";
//eth
export const PURSE_TOKEN_404_UPGRADABLE_ADDRESS_ETH =
  "0x95987b0cdC7F65d989A30B3B7132a38388c548Eb";
export const REWARDS_CONTRACT_ADDRESS_ETH =
  "0x59F3B62FE70aD19B67C0a09Deb76dda4516C5387";

//goerli
export const PURSE_TOKEN_404_UPGRADABLE_ADDRESS_ETH_GOERLI =
  "0xEf6209FbA140A6e7b74bEa978a9788d185EA2eED";

//Provider
export const PROVIDER = "https://fx-json-web3.functionx.io:8545";

//APIs
export const COINGECKO_API = `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin%2Cweth%2Cbinance-usd%2Cusd-coin%2Ctether%2Cbitcoin%2Cpundi-x-purse&vs_currencies=usd`;
export const MONGO_RESPONSE_0_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/PundiX`;
export const MONGO_RESPONSE_1_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/CumulativeTransfer`;
export const MONGO_RESPONSE_2_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/CumulativeBurn`;
export const MONGO_FXSWAP_RESPONSE_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/tvl_prod`;

export const SUBGRAPH_API =
  "https://api.goldsky.com/api/public/project_clz6ti9bm1qjm01086dflgsh3/subgraphs/pursetoken/0.0.1/gn";

export const SUBGRAPH_DELAY_TOLERANCE_MS = 14400; // 4 * 60 * 60 (4 hours)

//RPC URLs
export const WALLETCONNECT_BRIDGE_URL =
  "https://wallet-connect.pundix.com/bridge/";
export const BSC_MAINNET_RPCURL = `https://bsc-dataseed3.bnbchain.org`;
export const BSC_MAINNET_RPCURL_1 = "https://bsc-dataseed1.binance.org/";
export const BSC_TESTNET_RPC_URL_S2 = `https://data-seed-prebsc-1-s2.binance.org:8545/`;
export const BSC_TESTNET_RPC_URL_S3 = `https://data-seed-prebsc-1-s3.binance.org:8545/`;
export const BSC_MAINNET_BLOCKEXPLORER = "https://bscscan.com/";
export const BSC_TESTNET_BLOCKEXPLORER = "https://testnet.bscscan.com/";

export const ETH_MAINNET_RPCURL = `https://eth-mainnet.g.alchemy.com/v2/ys3HjCPG2MtGQKu3W0W7_mxKWkcVW91n`;
export const ETH_TESTNET_RPCURL_SEPOLIA = `https://eth-sepolia.g.alchemy.com/v2/fEw7Yl72IyAkRazUK8rq9HmH0ICsOgpO`;
export const ETH_TESTNET_RPCURL_GOERLI = `https://endpoints.omniatech.io/v1/eth/goerli/public`;
export const ETH_MAINNET_BLOCKEXPLORER = "https://etherscan.io/";
export const ETH_TESTNET_BLOCKEXPLORER_SEPOLIA =
  "https://sepolia.etherscan.io/";
export const ETH_TESTNET_BLOCKEXPLORER_GOERLI = "https://goerli.etherscan.io/";

//Retroactive Rewards figures
export const RETROACTIVE_INITIAL_REWARDS = 162164878;
export const RETROACTIVE_AUG23_REWARDS = 837835122;
export const RETROACTIVE_PERIOD_DAYS = 365;

// links
export const PURSE_LAND_LINK = "https://purse.land/";
export const PURSE_TOKEN_ETHERSCAN_LINK =
  "https://etherscan.io/token/0x95987b0cdc7f65d989a30b3b7132a38388c548eb";
