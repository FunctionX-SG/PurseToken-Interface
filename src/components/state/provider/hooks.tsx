import { useEffect, useState } from 'react'
import { useAppSelector } from '../hooks'
import { JsonRpcProvider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { Signer } from 'ethers'

// import { setTrigger } from './reducer'

export function useProvider():{bscProvider:JsonRpcProvider,fxProvider:JsonRpcProvider,signer:Signer|undefined} {
  const bscProvider = useAppSelector((state) => state.provider.provider.bscProvider)
  const fxProvider = useAppSelector((state) => state.provider.provider.fxProvider)
  const {provider,account} = useWeb3React()
  const [signer,setSigner] = useState<Signer>()
  useEffect(()=>{
    if (provider){
      setSigner(provider.getSigner(account))
    }
  },[provider,account])
  return {bscProvider,fxProvider,signer}
}
