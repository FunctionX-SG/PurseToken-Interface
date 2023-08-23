import React from 'react';
import ReactDOM from 'react-dom';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// import './index.css';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import type { MetaMask } from '@web3-react/metamask'
import { hooks as metaMaskHooks, metaMask } from './components/connectors/metamask'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { hooks as walletConnectV2Hooks, walletConnectV2 } from './components/connectors/walletConnect'

const connectors: [MetaMask|WalletConnect, Web3ReactHooks][] = [
    [walletConnectV2,walletConnectV2Hooks],
    [metaMask, metaMaskHooks],
]
function Child() {
    const { connector } = useWeb3React()
    return null
}

const container = document.getElementById('root') as HTMLElement
createRoot(container).render(
    <Web3ReactProvider connectors={connectors}>
        <Child />
        <App />
    </Web3ReactProvider>
);
serviceWorker.unregister();