import type { AddEthereumChainParameter } from '@web3-react/types'

interface BasicChainInformation {
    urls: string[]
    name: string
}

interface ExtendedChainInformation extends BasicChainInformation {
    nativeCurrency: AddEthereumChainParameter['nativeCurrency']
    blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
}

type ChainConfig = { [chainId: number]: BasicChainInformation | ExtendedChainInformation }

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
  }
  
const CELO: AddEthereumChainParameter['nativeCurrency'] = {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
}

export const MAINNET_CHAINS: ChainConfig = {
    56: {
      urls: ['url1','url2'].filter(Boolean),
      name: 'BSC',
    },
    137: {
      urls: ['url3','https://polygon-rpc.com'].filter(Boolean),
      name: 'Polygon Mainnet',
      nativeCurrency: MATIC,
      blockExplorerUrls: ['https://polygonscan.com'],
    },
    42220: {
      urls: ['url4','https://forno.celo.org'],
      name: 'Celo',
      nativeCurrency: CELO,
      blockExplorerUrls: ['https://explorer.celo.org'],
    },
  }