import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import type { MetaMask } from '@web3-react/metamask'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metamask'
import { getName } from '../utils'
import { ReactNode } from 'react'

const connectors: [MetaMask, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks]
]

function Child() {
  const { connector } = useWeb3React()
  console.log(`Priority Connector is: ${getName(connector)}`)
  return null
}

export default function ProviderExample({children}:{children:ReactNode}) {

}