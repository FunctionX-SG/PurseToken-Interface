import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'

import { setTrigger } from './reducer'

export function useWalletTrigger():[boolean,(value:boolean)=>void] {
  const dispatch = useAppDispatch()
  const walletTrigger = useAppSelector((state) => state.walletTrigger.value)
  const setWalletTrigger = useCallback(
    (value:boolean) => {
      dispatch(setTrigger(value))
    },
    [dispatch]
  )
  return [walletTrigger, setWalletTrigger]
}
