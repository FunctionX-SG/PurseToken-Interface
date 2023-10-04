import { useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks'
import { useWeb3React } from '@web3-react/core'
import { useToast } from '../toast/hooks'
import { isSupportedChain } from '../../utils'
import { walletConnectV2 } from '../../connectors/walletConnect'
import { metaMask } from '../../connectors/metamask'
import { getChainInfo } from '../../chains'

import { setNetwork } from './reducer'

export function useNetwork():[number,(chainId?:number)=>void] {
  const {isActive,connector,chainId} = useWeb3React()
  const [,showToast] = useToast()
  const network = useAppSelector((state) => state.network.network)
  const dispatch = useAppDispatch()
  const switchNetwork = useCallback(async(chainId:number=56)=>{
    try{
      if (!isActive){
        showToast("Connect wallet to proceed.","failure")
      } else if (!isSupportedChain(chainId)){
        console.log("Not supported chain")
      } else {
        if (connector===walletConnectV2){
          await connector.activate(chainId)
        } else if (connector===metaMask){
          const info = getChainInfo(chainId)
          const addChainParameter = {
            chainId,
            chainName: info.name,
            rpcUrls: info.urls,
            nativeCurrency: info.nativeCurrency,
            blockExplorerUrls: [info.blockExplorerUrls],
          }
          await connector.activate(addChainParameter)
        } else {
          await connector.activate()
        }
      }
    } catch (err:any) {
      showToast(err?.message,"failure")
    }
  },[connector,isActive,showToast])

  useEffect(()=>{
    dispatch(setNetwork(chainId))
  },[dispatch,chainId])

  return [network,switchNetwork]
}
