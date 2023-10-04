import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'

import { setValue } from './reducer'

export function usePursePrice():[number,(value:number)=>void] {
  const dispatch = useAppDispatch()
  const pursePrice = useAppSelector((state) => state.pursePrice.value)
  const setPursePrice = useCallback(
    (value:number) => {
      dispatch(setValue(value))
    },
    [dispatch]
  )
  return [pursePrice, setPursePrice]
}
