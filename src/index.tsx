import React from 'react';
import ReactDOM from 'react-dom';
import {StrictMode} from 'react';
// import {createRoot} from 'react-dom/client';
// import './index.css';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import type { MetaMask } from '@web3-react/metamask'
import { hooks as metaMaskHooks, metaMask } from './components/connectors/metamask'
import { getName } from './components/utils'

const connectors: [MetaMask, Web3ReactHooks][] = [
    [metaMask, metaMaskHooks]
]
function Child() {
    const { connector } = useWeb3React()
    console.log(`Priority Connector is: ${getName(connector)}`)
    return null
}


// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
// const rootElement = document.getElementById('root');
// const root = createRoot(rootElement!);
// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// );

ReactDOM.render(
    <Web3ReactProvider connectors={connectors}>
        <Child />
        <App />
    </Web3ReactProvider>
    , document.getElementById('root'));
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
serviceWorker.unregister();