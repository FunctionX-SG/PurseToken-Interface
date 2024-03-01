import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navb from "./Navbar";
import Main from "./Main";
import FarmMenu from "./FarmMenu";
import FXSwap from "./FXSwap";
import PurseStakeBinance from "../pages/PurseStakeBinance";
import Reward from "./Reward";
import Landing from "./Landing";
import Footer from "./Footer";
import "./Popup/Popup.css";
import "./App.css";
import * as Constants from "../constants";
import ToastList from "./ToastList/ToastList";
import useSWR from "swr";
import { usePursePrice } from "./state/PursePrice/hooks";
import ConnectWallet from "./ConnectWallet";

export default function App() {
  const [, setPursePrice] = usePursePrice();

  const fetcher = (...args: any) => fetch(args).then((res) => res.json());
  const { data: PURSEPriceJson } = useSWR(Constants.COINGECKO_API, fetcher);

  useEffect(() => {
    if (PURSEPriceJson) setPursePrice(PURSEPriceJson["pundi-x-purse"]["usd"]);
  }, [PURSEPriceJson, setPursePrice]);

  return (
    <Router>
      <div>
        <ToastList position={"top-right"} />
        <ConnectWallet />
        <Navb />
        <div className="container-fluid mt-4">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto">
              <div className="content mr-auto ml-auto" id="content">
                <Routes>
                  <Route path="/" element={<Main />}></Route>

                  {/*<Route path="/home" element={<Main />}></Route>*/}

                  <Route path="/lpfarm/menu" element={<FarmMenu />}></Route>

                  <Route path="/lpfarm/fxswap" element={<FXSwap />}></Route>

                  <Route path="/rewards" element={<Reward />}></Route>

                  <Route path="/stake" element={<PurseStakeBinance />}></Route>
                </Routes>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
