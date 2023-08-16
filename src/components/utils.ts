
import { MetaMask } from '@web3-react/metamask'
import type { Connector } from '@web3-react/types'
import { hooks, metaMask } from './connectors/metamask'
import { useEffect, useState } from 'react'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  return 'Unknown'
}

export function connectWallet(){
  metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
  })
  console.log("connect successful")
}

export async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
      console.log(1)
    } else {
      await connector.activate()
      console.log(2)
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}