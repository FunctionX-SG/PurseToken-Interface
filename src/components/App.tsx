import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navb from './Navbar'
import Main from './Main'
import FarmMenu from './FarmMenu'
import FXSwap from './FXSwap'
import FarmInfo from './FarmInfo'
// import Distribution from './Distribution'
import Stake from './Stake'
import Reward from './Reward'
import Landing from './Landing'
import Footer from './Footer'
import './Popup/Popup.css'
import './App.css'
import * as Constants from "../constants"
import { Signer, ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { isSupportedChain } from './utils'
import { metaMask } from './connectors/metamask'
import { walletConnectV2 } from './connectors/walletConnect'
import { getChainInfo } from './chains'
import ToastList from './ToastList/ToastList'
import useSWR from 'swr'


export default function App() {
  const farmNetwork = "MAINNET"
  const bscProvider = new ethers.providers.JsonRpcProvider(Constants.BSC_MAINNET_RPCURL)
  const fxProvider = new ethers.providers.JsonRpcProvider(Constants.PROVIDER)
  
  const { account, provider, connector, isActive } = useWeb3React()
  const [signer, setSigner] = useState<Signer>()
  const [PURSEPrice, setPURSEPrice] = useState('0')

  const fetcher = (...args:any) => fetch(args).then((res) => res.json());
  const {data:PURSEPriceJson} = useSWR(Constants.COINGECKO_API,fetcher)

  useEffect(()=>{
    if (PURSEPriceJson) setPURSEPrice(PURSEPriceJson["pundi-x-purse"]["usd"])
  },[PURSEPriceJson])

  useEffect(()=>{
  },[])

  useEffect(()=>{
    if (provider){
      setSigner(provider.getSigner(account))
    }
  },[account,provider])

  async function switchNetwork(chainId:number=56) {
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
  }

  const [toasts, setToasts] = useState<any>([]);

  const showToast = (message:string, type:string, link?:string) => {
    const toast = {
      id: Date.now(),
      message,
      link,
      type,
    };

    setToasts((_toast:any)=>[toast,..._toast]);

    let time:number = 5
    if (type==="success"){
      time = 8
    }

    setTimeout(() => {
      removeToast(toast.id);
    }, time * 1000);
  };

  const removeToast = (id:number) => {
    setToasts((prevToasts:any) => prevToasts.filter((toast:any) => toast.id !== id))
  };



  return (
    <Router>
      <div>
        <ToastList data={toasts} position={"bottom-right"} removeToast={removeToast} />
        <Navb
          PURSEPrice={PURSEPrice}
          switchNetwork={switchNetwork}
          showToast={showToast}
        />
        <div className="container-fluid mt-4">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '1000px' }}>
              <div className="content mr-auto ml-auto" id="content">
                <Routes>

                  <Route path="/" element={
                  <Landing/>
                  }></Route>

                  <Route path="/home" element={
                    <Main 
                    bscProvider={bscProvider} 
                    account={account}
                    PURSEPrice={PURSEPrice}
                    />
                  }></Route>
                  
                  <Route path="/lpfarm/menu" element={
                    <FarmMenu
                    account={account}
                    bscProvider={bscProvider}
                    farmNetwork={farmNetwork}
                    signer={signer}
                    switchNetwork={switchNetwork}
                    showToast={showToast}
                    />
                  }></Route>

                  <Route path="/lpfarm/farmInfo" element={
                    <FarmInfo
                    bscProvider={bscProvider}
                    account={account}
                    />
                  }></Route>
                  
                  <Route path="/lpfarm/fxswap" element={
                    <FXSwap
                    fxProvider={fxProvider}
                    />
                  }></Route>

                  <Route path="/rewards" element={
                    <Reward
                    bscProvider={bscProvider}
                    PURSEPrice={PURSEPrice}
                    switchNetwork={switchNetwork}
                    showToast={showToast}
                    />
                  }></Route>

                  <Route path="/stake" element={
                    <Stake
                    bscProvider={bscProvider}
                    signer={signer}
                    PURSEPrice={PURSEPrice}
                    switchNetwork={switchNetwork}
                    showToast={showToast}
                    />
                  }></Route>
                  
                </Routes>
              </div>
            </main>
          </div>
        </div>
        <Footer/>
      </div>
    </Router>
  );
  
}