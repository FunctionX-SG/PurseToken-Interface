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


export default function App() {
  const farmNetwork = "MAINNET"
  const bscProvider = new ethers.providers.JsonRpcProvider(Constants.BSC_MAINNET_RPCURL)
  const fxProvider = new ethers.providers.JsonRpcProvider(Constants.PROVIDER)
  
  const { account, provider } = useWeb3React()
  const [signer, setSigner] = useState<Signer>()
  const [PURSEPrice, setPURSEPrice] = useState('0')

  useEffect(()=>{
    async function loadBlockchainData() {
      let coingeckoResponse = await fetch(Constants.COINGECKO_API);
      let myJson3 = await coingeckoResponse.json();
      let _PURSEPrice = myJson3["pundi-x-purse"]["usd"]
      setPURSEPrice(_PURSEPrice.toFixed(7))
    }
    loadBlockchainData()
  },[])

  useEffect(()=>{
    if (provider){
      setSigner(provider.getSigner(account))
    }
  },[account,provider])

  return (
    <Router>
      <div>
        <Navb
          PURSEPrice={PURSEPrice}
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
                    />
                  }></Route>
                  
                  <Route path="/lpfarm/menu" element={
                    <FarmMenu
                    account={account}
                    bscProvider={bscProvider}
                    farmNetwork={farmNetwork}
                    signer={signer}
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
                    />
                  }></Route>

                  <Route path="/stake" element={
                    <Stake
                    bscProvider={bscProvider}
                    signer={signer}
                    PURSEPrice={PURSEPrice}
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