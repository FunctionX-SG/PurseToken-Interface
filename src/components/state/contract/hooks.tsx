import { useAppSelector } from '../hooks'

// import { setTrigger } from './reducer'

export function useContract(){
  const contract = useAppSelector((state) => state.contract.contract)

  return contract
}
