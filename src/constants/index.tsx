
//BSC mainnet: 56, testnet: 97
export const NETWORK_ID = "56";
export const CHAIN_ID = 56;

//Contract Addresses
// bsc
// export const PURSE_BUSD_PAIR_ADDRESS = "0x081F4B87F223621B4B31cB7A727BB583586eAD98"; //testnet
export const PURSE_USDT_PAIR_ADDRESS = "0x91608680D6547a1998D9932B5ff6EE0b38d9CBC7" //testnet
export const PURSE_TOKEN_UPGRADABLE_ADDRESS = "0xC1ba0436DACDa5aF5A061a57687c60eE478c4141"; //testnet
export const RESTAKING_FARM_ADDRESS = "0xDD3B0B5e54A1676a5A9504e8ac9629Aee77eC46a"; //testnet
export const PURSE_STAKING_ADDRESS = "0x8A6aFc7D27cDFf9FDC6b4efa63a757333eB58508"; //testnet
export const PURSE_STAKING_VESTING_ADDRESS = "0x74019d73c9E4d6FE5610C20df6b0FFCe365c4053" //testnet
export const TREASURY_ADDRESS = "0x774029863759eEd41B6f7Fe12dc5D44Ec9eD4bCB" //testnet
export const RETROACTIVE_REWARDS_ADDRESS = "0xb05E493B83f05B7Cfd25F94C084d577EA802D6A8"; //testnet
export const REWARD_DISTRIBUTOR_ADDRESS = "0xdb307306ae74EefaCf26afdca25C5A11D5b7e09e" //testnet
export const REWARD_ADDRESS = "0x50c643a188Ab7471dF9943E5Efb4949ac4cD4092"
// fx
export const FIP20UPGRADABLE_ADDRESS = "0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687";
export const MASTERCHEFV2_ADDRESS = "0x4bd522b2E25f6b1A874C78518EF25f5914C522dC"

//Provider
export const PROVIDER = "https://fx-json-web3.functionx.io:8545";

//APIs
export const COINGECKO_API = `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin%2Cweth%2Cbinance-usd%2Cusd-coin%2Ctether%2Cbitcoin%2Cpundi-x-purse&vs_currencies=usd`;
export const MONGO_RESPONSE_0_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/PundiX`;
export const MONGO_RESPONSE_1_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/CumulativeTransfer`;
export const MONGO_RESPONSE_2_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/CumulativeBurn`;
export const MONGO_FXSWAP_RESPONSE_API = `https://ap-southeast-1.aws.data.mongodb-api.com/app/data-rjjms/endpoint/tvl_prod`;

//RPC URLs
export const WALLETCONNECT_BRIDGE_URL = "https://wallet-connect.pundix.com/bridge/";
export const BSC_MAINNET_RPCURL = `https://bsc-dataseed3.bnbchain.org`;
export const BSC_MAINNET_RPCURL_1 = 'https://bsc-dataseed1.binance.org/';
export const BSC_TESTNET_RPC_URL_S2 = `https://data-seed-prebsc-1-s2.binance.org:8545/`;
export const BSC_TESTNET_RPC_URL_S3 = `https://data-seed-prebsc-1-s3.binance.org:8545/`;
export const BSC_MAINNET_BLOCKEXPLORER = 'https://bscscan.com/';
export const BSC_TESTNET_BLOCKEXPLORER = 'https://testnet.bscscan.com/';

//Retroactive Rewards figures
export const RETROACTIVE_INITIAL_REWARDS = 162164878;
export const RETROACTIVE_AUG23_REWARDS = 837835122;
export const RETROACTIVE_PERIOD_DAYS = 365;