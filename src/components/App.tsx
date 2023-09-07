import React, { useEffect } from 'react'
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
import { useWeb3React } from '@web3-react/core'
import { isSupportedChain } from './utils'
import { metaMask } from './connectors/metamask'
import { walletConnectV2 } from './connectors/walletConnect'
import { getChainInfo } from './chains'
import ToastList from './ToastList/ToastList'
import useSWR from 'swr'
import { useToast } from './state/toast/hooks'
import { usePursePrice } from './state/PursePrice/hooks'
import ConnectWallet from './ConnectWallet'

export default function App() {
  
  const { connector, isActive } = useWeb3React()
  const [,setPursePrice] = usePursePrice()
  const [,showToast] = useToast()

  const fetcher = (...args:any) => fetch(args).then((res) => res.json());
  const {data:PURSEPriceJson} = useSWR(Constants.COINGECKO_API,fetcher)

  useEffect(()=>{
    if (PURSEPriceJson) setPursePrice(PURSEPriceJson["pundi-x-purse"]["usd"])
  },[PURSEPriceJson,setPursePrice])



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



  return (
    <Router>
      <div>
        <ToastList position={"bottom-right"}/>
        <ConnectWallet/>
        <Navb
          switchNetwork={switchNetwork}
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
                    />
                  }></Route>
                  
                  <Route path="/lpfarm/menu" element={
                    <FarmMenu
                    switchNetwork={switchNetwork}
                    />
                  }></Route>

                  <Route path="/lpfarm/farmInfo" element={
                    <FarmInfo
                    />
                  }></Route>
                  
                  <Route path="/lpfarm/fxswap" element={
                    <FXSwap
                    />
                  }></Route>

                  <Route path="/rewards" element={
                    <Reward
                    switchNetwork={switchNetwork}
                    />
                  }></Route>

                  <Route path="/stake" element={
                    <Stake
                    switchNetwork={switchNetwork}
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