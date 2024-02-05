import React, { useEffect, useState } from "react";
import purse from "../../assets/images/purse.png";
import fox from "../../assets/images/metamask-fox.svg";
import walletconnectLogo from "../../assets/images/walletconnect-logo.svg";
import Buttons from "react-bootstrap/Button";
import "reactjs-popup/dist/index.css";
import MediaQuery, { useMediaQuery } from "react-responsive";
import { FaWallet } from "react-icons/fa";
import { slide as Menu } from "react-burger-menu";
import Dropdown from "react-bootstrap/Dropdown";
import "../App.css";
import { useWeb3React } from "@web3-react/core";
import { metaMask } from "../connectors/metamask";
import { walletConnectV2 } from "../connectors/walletConnect";
import {
  chainId2NetworkName,
  getShortAccount,
  isSupportedChain,
} from "../utils";
import { useToast } from "../state/toast/hooks";
import CloseButton from "react-bootstrap/CloseButton";

import { NavLink, NavLinkHome } from "./NavMenu";
import { usePursePrice } from "../state/PursePrice/hooks";
import { useNetwork } from "../state/network/hooks";
import { Link } from "react-router-dom";

export default function Navb() {
  const FULL_VIEWABLE_NAV_MIN_WIDTH = 961;
  const FULL_VIEWABLE_WALLET_MIN_WIDTH = 601;

  const { chainId, account, connector, hooks } = useWeb3React();
  const [PURSEPrice] = usePursePrice();
  const [, showToast] = useToast();
  const { useSelectedIsActive, useSelectedIsActivating } = hooks;
  const isActive = useSelectedIsActive(connector);
  const isActivating = useSelectedIsActivating(connector);
  const [networkName, setNetworkName] = useState<string>();
  const [, switchNetwork] = useNetwork();

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem("isWalletConnected") === "metamask") {
        try {
          await metaMask.connectEagerly();
        } catch (ex) {
          console.log(ex);
        }
      } else if (localStorage?.getItem("isWalletConnected") === "wc2") {
        try {
          await walletConnectV2.connectEagerly();
        } catch (ex) {
          console.log(ex);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  useEffect(() => {
    if (!chainId) {
      return;
    }
    if (isSupportedChain(chainId)) {
      setNetworkName(chainId2NetworkName(chainId));
    } else {
      setNetworkName("Unsupported Network");
    }
  }, [chainId]);

  const metamaskConnect = async () => {
    if (isActive) {
      if (metaMask?.deactivate) {
        metaMask.deactivate();
      } else {
        metaMask.resetState();
      }
    } else if (!isActivating) {
      try {
        await metaMask.activate();
        localStorage.setItem("isWalletConnected", "metamask");
      } catch (err) {
        metaMask.resetState();
        console.log(err);
      }
    }
  };

  const WalletConnectV2 = async () => {
    if (isActive) {
      if (walletConnectV2?.deactivate) {
        walletConnectV2.deactivate();
      } else {
        walletConnectV2.resetState();
      }
    } else if (!isActivating) {
      try {
        showToast(
          "If WalletConnect doesn't pop up, try to refresh the page.",
          "warning"
        );
        await walletConnectV2.activate();
        localStorage.setItem("isWalletConnected", "wc2");
      } catch (err) {
        walletConnectV2.resetState();
        console.log(err);
      }
    }
  };

  const disconnect = async () => {
    if (!isActive) {
      return;
    }
    if (connector?.deactivate) {
      await connector.deactivate();
    } else {
      await connector.resetState();
    }
    localStorage.setItem("isWalletConnected", "false");
  };

  const [notice, setNotice] = useState(true); // set to true to show notice
  const [navbarTop, setNavbarTop] = useState(notice ? "38px" : "0");
  const closeNotice = () => {
    setNotice(false);
    setNavbarTop("0");
  };

  const isNavbarTop = useMediaQuery({
    minWidth: FULL_VIEWABLE_NAV_MIN_WIDTH,
  });
  useEffect(() => {
    if (!isNavbarTop) setNavbarTop("0");
    else {
      if (notice) setNavbarTop("38px");
    }
  }, [isNavbarTop, notice]);

  return (
    <>
      {/* Notice */}
      {notice ? (
        <>
          <MediaQuery minWidth={FULL_VIEWABLE_NAV_MIN_WIDTH}>
            <nav
              className="navbar top flex-md-nowrap p-0 shadow"
              style={{
                height: "38px",
                position: "fixed",
                width: "100%",
                top: "0",
                zIndex: "9",
                backgroundColor: "rgb(186, 0, 255)",
                color: "white",
                fontSize: "15px",
              }}
            >
              <span className="center" style={{ width: "100%", color: "#fff" }}>
                Check out the new roadmap of Purse at &nbsp;
                <a
                  href="https://purse.land/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "white" }}
                >
                  <u>purse.land</u>
                </a>
              </span>
              <CloseButton
                data-bs-theme="dark"
                aria-label="Hide"
                onClick={() => {
                  closeNotice();
                }}
                className="mr-2 close-notice"
                style={{
                  color: "#fff",
                  fontSize: "30px",
                  width: "30px",
                  height: "30px",
                }}
              />
            </nav>
          </MediaQuery>
          <MediaQuery maxWidth={FULL_VIEWABLE_NAV_MIN_WIDTH - 1}>
            <nav
              className="navbar top flex-md-nowrap p-0 shadow"
              style={{
                height: "58px",
                position: "fixed",
                width: "100%",
                bottom: "0",
                zIndex: "9",
                backgroundColor: "rgb(186, 0, 255)",
                color: "white",
                fontSize: "15px",
              }}
            >
              <span className="center" style={{ width: "100%", color: "#fff" }}>
                Check out the new roadmap of Purse at &nbsp;
                <a
                  href="https://purse.land/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "white" }}
                >
                  <u>purse.land</u>
                </a>
              </span>
              <CloseButton
                data-bs-theme="dark"
                aria-label="Hide"
                onClick={() => {
                  closeNotice();
                }}
                className="mr-2 close-notice"
                style={{
                  color: "#fff",
                  fontSize: "30px",
                  width: "30px",
                  height: "30px",
                }}
              />
            </nav>
          </MediaQuery>
        </>
      ) : (
        <></>
      )}
      {/* Navbar top:38px if there is notice */}
      <nav
        className="navbar navbar-dark top bg-dark flex-md-nowrap p-0"
        style={{
          height: "50px",
          position: "fixed",
          width: "100%",
          top: navbarTop,
          zIndex: "9",
        }}
      >
        <div className="navbar-brand col-sm-3 col-md-2 mt-1 md-1 mr-0 rowB">
          <MediaQuery maxWidth={FULL_VIEWABLE_NAV_MIN_WIDTH - 1}>
            <Menu>
              {/*<div className="dropdown0">*/}
              {/*  <NavLink to="/home">Home</NavLink>*/}
              {/*</div>*/}
              <div className="dropdown0">
                <NavLink to="/lpfarm/menu">FARM</NavLink>
              </div>
              <div className="dropdown0">
                <NavLink to="/stake/bsc">Stake - BSC</NavLink>
              </div>
              <div className="dropdown0">
                <NavLink to="/stake/eth">Stake - Eth</NavLink>
              </div>
              <div className="dropdown0">
                <NavLink to={"/purseboxnft"}>PURSE BOX</NavLink>
              </div>
              <div className="dropdown">
                <span
                  className="hover"
                  style={{ fontSize: "16px" }}
                  onClick={() => {
                    window.open(
                      `https://pundix-purse.gitbook.io/untitled/`,
                      "_blank"
                    );
                  }}
                >
                  {" "}
                  DOCS
                </span>
              </div>
            </Menu>
          </MediaQuery>
          <NavLinkHome
            className="mr-5 ml-4 rowC"
            style={{ cursor: "pointer" }}
            to="/"
          >
            <img
              src={purse}
              width="30"
              height="30"
              className="d-inline-block"
              alt=""
            />
            &nbsp;
            <b className="textWhiteHeading"> PURSE </b>
          </NavLinkHome>
          &nbsp;&nbsp;&nbsp;
          <MediaQuery minWidth={FULL_VIEWABLE_NAV_MIN_WIDTH}>
            {/*<div className="mr-4">*/}
            {/*  <NavLink to="/home">Home</NavLink>*/}
            {/*</div>*/}
            <div className="mr-4">
              <NavLink to="/lpfarm/menu">FARM</NavLink>
            </div>
            <div className="mr-4">
              <Dropdown>
                <Dropdown.Toggle
                  className="center"
                  variant="transparent"
                  style={{ padding: 0, color: "#fff" }}
                >
                  Stake
                </Dropdown.Toggle>
                <Dropdown.Menu
                  style={{ backgroundColor: "#181818", marginTop: "8px" }}
                >
                  <Dropdown.Item as={Link} to="/stake/bsc">
                    <div
                      className="dropdown0"
                      style={{ paddingBottom: "12px" }}
                    >
                      Binance
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/stake/eth">
                    <div className="dropdown">Ethereum</div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className={"mr-4"}></div>
            <div>
              <span
                className="hover"
                style={{ fontSize: "16px" }}
                onClick={() => {
                  window.open(
                    `https://pundix-purse.gitbook.io/untitled/`,
                    "_blank"
                  );
                }}
              >
                {" "}
                DOCS
              </span>
            </div>
          </MediaQuery>
        </div>

        <span>
          <ul className="navbar-nav px-3">
            {/* <li className="nav-item text-nowrap-small d-none d-sm-none d-sm-block"> */}
            <div className="text-light rowC">
              <MediaQuery minWidth={FULL_VIEWABLE_WALLET_MIN_WIDTH}>
                <div className="rowC">
                  <span
                    className="dropdown1 center"
                    onClick={() => {
                      window.open(
                        `https://pancakeswap.finance/swap?inputCurrency=0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C&outputCurrency=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56`,
                        "_blank"
                      );
                    }}
                  >
                    {" "}
                    <img
                      src={purse}
                      width="30"
                      height="30"
                      className="d-inline-block align-top"
                      alt=""
                    />
                    &nbsp;${PURSEPrice}
                  </span>
                </div>
                &nbsp;
                {chainId ? (
                  <div className="center">
                    <Buttons
                      variant="info"
                      size="sm"
                      onClick={async () => {
                        if (!isSupportedChain(chainId)) {
                          switchNetwork();
                        }
                      }}
                    >
                      {networkName}
                    </Buttons>
                  </div>
                ) : null}
                &nbsp;
                <div className="center">
                  {account ? (
                    <div>
                      <Dropdown>
                        <Dropdown.Toggle variant="secondary" size="sm">
                          {getShortAccount(account)}
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          style={{
                            backgroundColor: "#181818",
                            marginTop: "8px",
                          }}
                        >
                          <Dropdown.Item>
                            <div
                              className="dropdown0"
                              style={{ paddingBottom: "12px" }}
                              onClick={() => {
                                window.open(
                                  `https://bscscan.com/address/${account}`,
                                  "_blank"
                                );
                              }}
                            >
                              &nbsp;Wallet
                            </div>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <div
                              className="dropdown"
                              onClick={async () => {
                                await disconnect();
                                // setWalletTrigger(false)
                                // if (walletConnect === true) {
                                //   WalletDisconnect()
                                // }
                              }}
                            >
                              &nbsp;Disconnect
                            </div>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ) : (
                    <div>
                      <Dropdown>
                        <Dropdown.Toggle variant="secondary" size="sm">
                          Connect Wallet
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          style={{
                            backgroundColor: "#181818",
                            marginTop: "8px",
                          }}
                        >
                          <Dropdown.Item>
                            <div
                              className="dropdown0"
                              style={{ paddingBottom: "12px" }}
                              onClick={async () => {
                                await metamaskConnect();
                              }}
                            >
                              <img
                                src={fox}
                                width="23"
                                height="23"
                                className="d-inline-block"
                                alt=""
                              />
                              &nbsp; Metamask
                            </div>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <div
                              className="dropdown"
                              onClick={async () => {
                                await WalletConnectV2();
                              }}
                            >
                              <img
                                src={walletconnectLogo}
                                width="26"
                                height="23"
                                className="d-inline-block"
                                alt=""
                              />
                              &nbsp; WalletConnect
                            </div>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                </div>
              </MediaQuery>
              <MediaQuery maxWidth={FULL_VIEWABLE_WALLET_MIN_WIDTH - 1}>
                <Dropdown
                  style={{ position: "absolute", top: "0px", right: "-2px" }}
                >
                  <Dropdown.Toggle variant="transparent">
                    <FaWallet size={20} style={{ color: "white" }} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    style={{ backgroundColor: "#181818", marginTop: "5px" }}
                  >
                    <Dropdown.Item>
                      <Buttons
                        variant="secondary"
                        size="sm"
                        style={{
                          width: "100%",
                          backgroundColor: "#6A5ACD",
                          marginTop: "10px",
                        }}
                        className="center"
                        onClick={() => {
                          window.open(
                            `https://pancakeswap.finance/swap?inputCurrency=0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C&outputCurrency=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56`,
                            "_blank"
                          );
                        }}
                      >
                        {" "}
                        <img
                          src={purse}
                          width="30"
                          height="30"
                          className="d-inline-block align-top"
                          alt=""
                        />
                        &nbsp;${PURSEPrice}
                      </Buttons>
                    </Dropdown.Item>
                    {chainId ? (
                      <Dropdown.Item>
                        <Buttons
                          variant="info"
                          size="sm"
                          style={{ width: "100%" }}
                          onClick={async () => {
                            if (!isSupportedChain(chainId)) {
                              switchNetwork();
                            }
                          }}
                        >
                          {networkName}
                        </Buttons>
                      </Dropdown.Item>
                    ) : null}
                    {account ? (
                      <div>
                        <Dropdown.Item>
                          <Buttons
                            variant="secondary"
                            size="sm"
                            style={{ width: "100%" }}
                          >
                            {" "}
                            {getShortAccount(account)}
                          </Buttons>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Buttons
                            variant="secondary"
                            size="sm"
                            style={{ width: "100%" }}
                            onClick={() => {
                              window.open(
                                `https://bscscan.com/address/${account}`,
                                "_blank"
                              );
                            }}
                          >
                            &nbsp;Wallet
                          </Buttons>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Buttons
                            variant="secondary"
                            size="sm"
                            style={{ width: "100%", marginBottom: "10px" }}
                            onClick={async () => {
                              await disconnect();
                            }}
                          >
                            &nbsp;Disconnect
                          </Buttons>
                        </Dropdown.Item>
                      </div>
                    ) : (
                      <div>
                        <Dropdown.Item>
                          <Buttons
                            variant="secondary"
                            size="sm"
                            style={{ width: "100%" }}
                            onClick={async () => {
                              await metamaskConnect();
                            }}
                          >
                            <img
                              src={fox}
                              width="23"
                              height="23"
                              className="d-inline-block"
                              alt=""
                            />
                            &nbsp; Metamask
                          </Buttons>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Buttons
                            variant="secondary"
                            size="sm"
                            style={{ width: "100%", marginBottom: "10px" }}
                            onClick={async () => {
                              await WalletConnectV2();
                            }}
                          >
                            <img
                              src={walletconnectLogo}
                              width="26"
                              height="23"
                              className="d-inline-block"
                              alt=""
                            />
                            &nbsp; WalletConnect
                          </Buttons>
                        </Dropdown.Item>
                      </div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </MediaQuery>
            </div>
            {/* </li> */}
          </ul>
        </span>
      </nav>
    </>
  );
}
