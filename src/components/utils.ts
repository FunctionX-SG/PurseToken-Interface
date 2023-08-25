
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import type { Connector } from '@web3-react/types'
import PurseFarm from '../farm/farmPurse.json'
import { Signer, ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  else if (connector instanceof WalletConnect) return 'WalletConnectV2'
  return 'Unknown'
}

export function getShortAccount(account: string | undefined){
  if (!account){
    return ''
  }
  const first4Account = account.substring(0, 4)
  const last4Account = account.slice(-4)
  const _shortAccount = first4Account + '...' + last4Account
  return _shortAccount
}

export function getShortTxHash(txHash: string | undefined){
  if (!txHash){
    return ''
  }
  const first5 = txHash.substring(0, 5)
  const last5 = txHash.slice(-5)
  const _short = first5 + '....' + last5
  return _short
}

export function chainId2NetworkName(chainId:number){
  if (chainId === 97) {
    return "BSC Testnet"
  } else if (chainId === 56) {
    return "BSC"
  } else if (chainId === 1) {
    return "Ethereum"
  } else if (chainId === 3) {
    return "Ropsten"
  } else if (chainId === 4) {
    return "Rinkeby"
  } else if (chainId === 42) {
    return "Kovan"
  } else if (chainId === 137) {
    return "Polygon"
  } else if (chainId === 80001) {
    return "Mumbai"
  } else if (chainId === 43113) {
    return "Fuji"
  } else if (chainId === 43114) {
    return "Avalanche"
  } else {
    return "NaN"
  }
}

export function timeConverter(UNIX_timestamp:number) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
  var min = a.getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
  var sec = a.getSeconds().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

export function secondsToDhms(lockPeriod:number,remainingTime: number) {
  remainingTime = lockPeriod - Number(remainingTime);
  let d = Math.floor(remainingTime / (3600*24));
  let h = Math.floor(remainingTime % (3600*24) / 3600);
  let m = Math.floor(remainingTime % 3600 / 60);

  let dDisplay = d > 0 ? d + ("d ") : "";
  let hDisplay = h > 0 ? h + ("h ") : "";
  let mDisplay = m > 0 ? m + ("m ") : "";
  return remainingTime > 60 ? dDisplay + hDisplay + mDisplay : "< 1m";
}


export function getPoolSegmentInfo(_poolLength:number) {
  const farm = PurseFarm.farm
  let n = 0
  let _poolSegmentInfo :any[any] = [[],[]]
  for (let i = 0; i < _poolLength; i++) {
    let poolInfo = farm[i]
    if (poolInfo.lpTokenPairsymbol === "Cake-LP") {
      _poolSegmentInfo[0][n] = poolInfo
      n += 1
    } else {
      _poolSegmentInfo[1][n] = poolInfo
      n += 1
    }
  }
}

export async function readContract(contract:ethers.Contract,method:string,...args:any[]){
  try{
    const result = await contract[method](...args)
    return result
  } catch (err){
    // console.log(err)
    return null
  }
}

export function formatBigNumber(bignumber:any,units:string){
  // if (!bignumber)
  if (bignumber && ethers.BigNumber.isBigNumber(bignumber)){
    return formatUnits(bignumber,units)
  }else{
    return "0"
  }
}

export function isSupportedChain(chainId:number|undefined){
  if (chainId!==56){
    return false
  } else {
    return true
  }
}

export function supportedChain(chainId:number|undefined){
  if (chainId!==56){
    return 56
  } else {
    return chainId
  }
}

export async function callContract(signer:Signer, contract:ethers.Contract|null,method:string,...args:any[]){
  try{
    const tx = await contract?.connect(signer)[method](...args)
    return tx
  } catch (err: any) {
    console.log(err)
    return err
  }
}

export const fetcher = (library:any) => (args:any) => {
  const {method, params} = args
  return library[method](...params)
}