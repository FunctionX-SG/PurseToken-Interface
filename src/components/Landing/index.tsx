import React from "react";
import Button from "react-bootstrap/Button";
import Blockchain from "../../assets/images/Blockchain.png";
import { NavLink } from "../Navbar/NavMenu";
import MediaQuery from "react-responsive";
import { IoStar } from "react-icons/io5";
import "../App.css";
import { Bounce, Zoom } from "react-awesome-reveal";

export default function Landing() {
  return (
    <div id="content" style={{ margin: "0 auto", maxWidth: "1000px" }}>
      <MediaQuery minWidth={961}>
        <div className="rowC">
          <div className="mt-5">
            <div className="textWhite mt-5">
              <b>Pundi&nbsp;X&nbsp;PURSE</b>
            </div>
            <div className="textWhiteSmall mt-3" style={{ fontSize: "18px" }}>
              <b>
                PURSE, the Pundi X reward token, is now available on ERC20,
                BEP20, and Pundi X Chain.
              </b>
            </div>
            <div className="mt-5">
              <NavLink to="/home">
                <Zoom direction="left" triggerOnce>
                  <Button type="button" variant="info">
                    Get Started
                  </Button>
                </Zoom>
              </NavLink>
            </div>
          </div>
          <img src={Blockchain} width="600px" alt="" />
        </div>

        <div className="rowC mt-5">
          <Bounce direction="left" triggerOnce>
            <div
              className="mt-5 mr-4"
              style={{
                minWidth: "300px",
                padding: "15px",
                height: "150px",
                backgroundColor: "var(--basic-ash)",
              }}
            >
              <div className="textWhiteSmall">
                <b>Tokenomics</b>
              </div>
              <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
                <b>
                  PURSE incentivises XPOS use, grows Pundi X Chain's ecosystem,
                  and increases PUNDIX value with rewards, gamification,
                  discount vouchers, and NFT/Token redemptions.
                </b>
              </div>
            </div>
            <div
              className="mt-5 mr-4"
              style={{
                minWidth: "300px",
                padding: "15px",
                height: "150px",
                backgroundColor: "var(--basic-ash)",
              }}
            >
              <div className="textWhiteSmall">
                <b>LP Restaking Farm</b>
              </div>
              <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
                <b>
                  Providing liquidity on respective platform to receive LP
                  Tokens and earn PURSE by staking the LP Tokens in the LP
                  Restaking Farm.
                </b>
              </div>
            </div>
            <div
              className="mt-5"
              style={{
                minWidth: "300px",
                padding: "15px",
                height: "150px",
                backgroundColor: "var(--basic-ash)",
              }}
            >
              <div className="textWhiteSmall">
                <b>PURSE Staking</b>
              </div>
              <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
                <b>Stake PURSE and amplify your earnings with PURSE Staking.</b>
              </div>
            </div>
          </Bounce>
        </div>
      </MediaQuery>

      <MediaQuery maxWidth={960}>
        <div className="mt-4">
          <div className="textWhite">
            <b>Pundi&nbsp;X PURSE</b>
          </div>
          <div className="textWhiteSmall mt-3" style={{ fontSize: "18px" }}>
            <b>
              PURSE, the Pundi X reward token, is now available on ERC20, BEP20,
              and Pundi X Chain.
            </b>
          </div>
          <div className="mt-5">
            <NavLink to="/home">
              <Zoom direction="left" triggerOnce>
                <Button type="button" variant="info">
                  Get Started
                </Button>
              </Zoom>
            </NavLink>
          </div>
        </div>

        <div className="center">
          <img
            src={Blockchain}
            width="70%"
            alt=""
            style={{ minWidth: "300px", maxWidth: "600px" }}
          />
        </div>

        <Bounce direction="left" triggerOnce>
          <div
            className="mt-5"
            style={{
              minWidth: "300px",
              padding: "15px",
              backgroundColor: "var(--basic-ash)",
            }}
          >
            <div className="textWhiteSmall">
              <b>Tokenomics</b>
            </div>
            <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
              <b>
                PURSE incentivises XPOS use, grows Pundi X Chain's ecosystem,
                and increases PUNDIX value with rewards, gamification, discount
                vouchers, and NFT/Token redemptions.
              </b>
            </div>
          </div>
        </Bounce>
        <Bounce direction="left" triggerOnce>
          <div
            className="mt-5"
            style={{
              minWidth: "300px",
              padding: "15px",
              backgroundColor: "var(--basic-ash)",
            }}
          >
            <div className="textWhiteSmall">
              <b>LP Restaking Farm</b>
            </div>
            <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
              <b>
                Providing liquidity on respective platform to receive LP Tokens
                and earn PURSE by staking the LP Tokens in the LP Restaking
                Farm.
              </b>
            </div>
          </div>
        </Bounce>
        <Bounce direction="left" triggerOnce>
          <div
            className="mt-5"
            style={{
              minWidth: "300px",
              padding: "15px",
              backgroundColor: "var(--basic-ash)",
            }}
          >
            <div className="textWhiteSmall">
              <b>PURSE Staking</b>
            </div>
            <div className="textWhite mt-2" style={{ fontSize: "13px" }}>
              <b>Stake PURSE and amplify your earnings with PURSE Staking.</b>
            </div>
          </div>
        </Bounce>
      </MediaQuery>

      <Bounce direction="right" triggerOnce>
        <div
          className="mt-5 textWhiteSmall"
          style={{
            minWidth: "300px",
            padding: "15px",
            backgroundColor: "var(--basic-ash)",
          }}
        >
          <div className="center">
            •&nbsp;•&nbsp;•&nbsp;&nbsp;What are the whitelisted
            transactions?&nbsp;&nbsp;•&nbsp;•&nbsp;•
          </div>
          <div className="mt-2 rowC" style={{ fontSize: "13px" }}>
            <IoStar style={{ minWidth: "12px", marginTop: "2px" }} />
            &nbsp;&nbsp;
            <div>
              PURSE harvested from PURSE-BUSD LP Restaking Farm contract
            </div>
          </div>
          <div className="mt-1 rowC" style={{ fontSize: "13px" }}>
            <IoStar style={{ minWidth: "12px", marginTop: "2px" }} />
            &nbsp;&nbsp;<div>PURSE staked into PURSE Staking contract</div>
          </div>
          <div className="mt-1 rowC" style={{ fontSize: "13px" }}>
            <IoStar style={{ minWidth: "12px", marginTop: "2px" }} />
            &nbsp;&nbsp;<div>PURSE withdrawn from PURSE Staking contract</div>
          </div>
          <div className="mt-1 rowC" style={{ fontSize: "13px" }}>
            <IoStar style={{ minWidth: "12px", marginTop: "2px" }} />
            &nbsp;&nbsp;
            <div>
              PURSE received when remove liquidity from PURSE-BUSD LP Pancake
              contract
            </div>
          </div>
          <div className="mt-1 rowC" style={{ fontSize: "13px" }}>
            <IoStar style={{ minWidth: "12px", marginTop: "2px" }} />
            &nbsp;&nbsp;
            <div>
              PURSE received when swap from BUSD using PURSE-BUSD PancakeSwap
            </div>
          </div>
        </div>
      </Bounce>
    </div>
  );
}
