import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import {Popup as ReactPopup} from 'reactjs-popup';
import { BsFillQuestionCircleFill, BsInfoCircleFill } from 'react-icons/bs'
import { IoStar } from 'react-icons/io5'
import { MdLockClock } from 'react-icons/md'
import { AiFillAlert } from 'react-icons/ai'
import { RiArrowRightFill } from 'react-icons/ri'
import ReactLoading from 'react-loading'
import * as Constants from "../../constants";
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import PurseStaking from '../../abis/PurseStaking.json'
import PurseTokenUpgradable from '../../abis/PurseTokenUpgradable.json'
import { BigNumber, ethers } from 'ethers'
import { callContract, formatBigNumber, readContract } from '../utils'
import ConnectWallet from '../ConnectWallet'

import '../App.css';
import { useWeb3React } from '@web3-react/core'

export default function Stake(props:any) {
    const {PURSEPrice, bscProvider, signer} = props
    const {isActive, account } = useWeb3React()
    const [mode, setMode] = useState('Stake')
    const [amount, setAmount] = useState('')
    const [message, setMessage] = useState('')
    const [purseMessage, setPurseMessage] = useState(false)
    const [purseAmount, setPurseAmount] = useState('')
    const [rewardAmount, setRewardAmount] = useState('')
    const [purseStakingUserReceipt, setPurseStakingUserReceipt] = useState(0)
    const [purseStakingUserNewReceipt, setPurseStakingUserNewReceipt] = useState(0)
    const [purseStakingUserWithdrawReward, setPurseStakingUserWithdrawReward] = useState(0)
    const [purseStakingUserStake, setPurseStakingUserStake] = useState(0)
    const [purseStakingUserAllowance, setPurseStakingUserAllowance] = useState(0)
    const [purseStakingTotalStake, setPurseStakingTotalStake] = useState(0)
    const [purseStakingTotalReceipt, setPurseStakingTotalReceipt] = useState(0)
    const [purseStakingUserLockTime, setPurseStakingUserLockTime] = useState(0)
    const [purseStakingLockPeriod, setPurseStakingLockPeriod] = useState(0)
    const [stakeLoading, setStakeLoading] = useState(true)
    const [purseTokenUpgradableBalance, setPurseTokenUpgradableBalance] = useState(0)
    const [sum30TransferAmount, setSum30TransferAmount] = useState(0)
    const [trigger, setTrigger] = useState(false)

    const purseStaking = new ethers.Contract(Constants.PURSE_STAKING_ADDRESS, PurseStaking.abi, bscProvider)
    const purseTokenUpgradable = new ethers.Contract(Constants.PURSE_TOKEN_UPGRADABLE_ADDRESS, PurseTokenUpgradable.abi, bscProvider)
    
    // const signer = bscProvider.getSigner(account)

    useEffect(()=>{
      async function loadData(){

        let purseStakingUserInfo = await readContract(purseStaking,"userInfo",account)
        
        if (purseStakingUserInfo){
          let _purseStakingUserReceipt = purseStakingUserInfo[0]
          setPurseStakingUserReceipt(parseFloat(formatUnits(_purseStakingUserReceipt,'ether')))

          let _purseStakingUserNewReceipt = purseStakingUserInfo[1]
          setPurseStakingUserNewReceipt(parseFloat(formatUnits(_purseStakingUserNewReceipt,'ether')))

          let _purseStakingUserWithdrawReward = purseStakingUserInfo[2]
          setPurseStakingUserWithdrawReward(parseFloat(formatUnits(_purseStakingUserWithdrawReward,'ether')))

          let _purseStakingUserLockTime = purseStakingUserInfo[3]
          setPurseStakingUserLockTime(parseFloat(_purseStakingUserLockTime.toString()))
        }

        let _purseTokenUpgradableBalance = await readContract(purseTokenUpgradable,"balanceOf",account)
        setPurseTokenUpgradableBalance(parseFloat(formatBigNumber(_purseTokenUpgradableBalance,'ether')))

        let _purseStakingUserStake = await readContract(purseStaking,"getTotalPurse",account)
        setPurseStakingUserStake(parseFloat(formatBigNumber(_purseStakingUserStake,'ether')))

        let _purseStakingUserAllowance = await readContract(purseTokenUpgradable,"allowance",account, Constants.PURSE_STAKING_ADDRESS)
        setPurseStakingUserAllowance(_purseStakingUserAllowance)

        let _purseStakingTotalReceipt = await purseStaking.totalReceiptSupply()
        setPurseStakingTotalReceipt(parseFloat(formatUnits(_purseStakingTotalReceipt,'ether')))

        let _purseStakingTotalStake = await purseTokenUpgradable.balanceOf(Constants.PURSE_STAKING_ADDRESS)
        setPurseStakingTotalStake(parseFloat(formatUnits(_purseStakingTotalStake,'ether')))

        let _purseStakingLockPeriod = await purseStaking.lockPeriod()
        setPurseStakingLockPeriod(parseFloat(_purseStakingLockPeriod.toString()))

        let response = await fetch(Constants.MONGO_RESPONSE_0_API);
        let myJson = await response.json()
        let _sum30TransferAmount = myJson["Transfer30Days"][0]
        setSum30TransferAmount(parseFloat(formatUnits(_sum30TransferAmount,'ether')))

      }
      loadData()
    },[])

    const onChangeHandler = (event:string) => {
        let result = !isNaN(parseFloat(event))
        let afterDot = event.split('.', 2)[1]
        let afterDotResult = true
        if (parseFloat(event) % 1 !== 0 && result === true) {
          if (afterDot.toString().length > 18) {
            afterDotResult = false
          } else {
            afterDotResult = true
          }
        }
        if (event.length >=2 && event[0]==='0' && event[1]!=='.') {
          result = false
        }
        if (event[0]==="."){
          result = false
        }
        
        if (event === "") {
            setAmount('')
            setMessage('')
        } else if (result === false) {
            setAmount('')
            setMessage('Not a valid number')
        } else if (parseFloat(event) <= 0) {
            setAmount('')
            setMessage("Value needs to be greater than 0")
        } else if (afterDotResult === false){
            setAmount('')
            setMessage("Value cannot have more than 18 decimals")
        } else {
            setAmount(event)
            setMessage('')
        }
    }

    const onClickHandlerDeposit = async () => {
        let amountWei = parseUnits(amount, 'ether')
        if (parseFloat(amount) < purseTokenUpgradableBalance) {
            alert("Insufficient PURSE to stake!")
        } else {
            await stake(amountWei)
        }
    }

    const onClickHandlerWithdraw = () => {
        let receiptWei = parseUnits(amount, 'ether')
        if ( parseFloat(amount) < parseFloat(purseStakingUserTotalReceipt) ) {
            alert("Insufficient Share to unstake!")
        } else {
            unstake(receiptWei)
        }
    }

    const onClickHandlerCheck = async () => {
        let receiptWei = parseUnits(amount, 'ether')
        if (amount < purseStakingUserTotalReceipt) {
            alert("Insufficient Share to withdraw!")
        } else {
            setPurseMessage(true)
            let _checkPurseAmount:string[] = await checkPurseAmount(receiptWei)
            let getPurseAmount = _checkPurseAmount[0] + " Share : " + parseFloat(_checkPurseAmount[3]).toLocaleString('en-US', { maximumFractionDigits: 18 })  + " PURSE (" + (parseFloat(_checkPurseAmount[3])*PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"
            let getRewardAmount = _checkPurseAmount[1] + " Share : " + parseFloat(_checkPurseAmount[2]).toLocaleString('en-US', { maximumFractionDigits: 18 })   + " PURSE (" + (parseFloat(_checkPurseAmount[2])*PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"
            setPurseAmount(getPurseAmount)
            setRewardAmount(getRewardAmount)
        }
    }

    // const setTrigger = (state:boolean) => {
      
    // }

    const stake = async (amount:BigNumber) => {
      if (isActive) {
        setStakeLoading(false)
        await callContract(signer,purseStaking,"enter",amount)
        setStakeLoading(true)
      }
    }

    const unstake = async (receipt:BigNumber) => {
      if (isActive) {
        setStakeLoading(false)
        await callContract(signer,purseStaking,"leave",receipt)
        setStakeLoading(true)
      }
    }

    const withdrawLocked = async () => {
      if (isActive) {
        setStakeLoading(false)
        await callContract(signer,purseStaking,"withdrawLockedAmount")
        setStakeLoading(true)
      }
    }

    const approvePurse = async () => {
      if (isActive) {
        setStakeLoading(false)
        await callContract(signer,purseTokenUpgradable,"approve",Constants.PURSE_STAKING_ADDRESS, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
        setStakeLoading(true)
      }
    }

    const checkPurseAmount = async (receipt:BigNumber) => {
      let _purseStakingTotalStake =  await purseTokenUpgradable.balanceOf(Constants.PURSE_STAKING_ADDRESS)
      let _purseStakingTotalReceipt = await purseStaking.totalReceiptSupply()
      let receiptToken = purseStakingUserReceipt
      let newArray:string[]
      let _receipt = parseFloat(formatUnits(receipt, 'ether'))
      if(receiptToken <= 0) {
        let purseReward = _receipt * _purseStakingTotalStake / _purseStakingTotalReceipt
        // let purseReward = formatUnits(purseRewardWei, 'ether').toString()
        newArray = ['0', _receipt.toString(), purseReward.toString(),'0']
      } else {
        if(_receipt > receiptToken) {
          let newReceipt = _receipt - receiptToken
          // let newReceipt_ =  formatUnits(newReceipt, 'ether').toString()
          let purseReward = newReceipt * _purseStakingTotalStake / _purseStakingTotalReceipt
          // let purseReward = formatUnits(purseRewardWei, 'ether').toString()

          let purse = receiptToken * _purseStakingTotalStake / _purseStakingTotalReceipt
          // let purse = formatUnits(purseWei, 'ether').toString()
          newArray = [receiptToken.toString(), newReceipt.toString() ,purseReward.toString(), purse.toString()]
        } else {
          let purse = _receipt * _purseStakingTotalStake / _purseStakingTotalReceipt
          // let purse = formatUnits(purseWei, 'ether').toString()
          newArray = [_receipt.toString(), '0', '0', purse.toString()]
        }
      }
      return newArray
    }


    let purseStakingAPR = (sum30TransferAmount*12*100/purseStakingTotalStake).toLocaleString('en-US', { maximumFractionDigits: 5 })
    let purseStakingUserTotalReceipt = (purseStakingUserReceipt + purseStakingUserNewReceipt).toString()
    let sharePercent = (purseStakingUserReceipt*100/purseStakingTotalReceipt).toLocaleString('en-US', { maximumFractionDigits: 5 })
    let sharePercent1 = (purseStakingUserNewReceipt*100/purseStakingTotalReceipt).toLocaleString('en-US', { maximumFractionDigits: 5 })
    let sharePercent2 = (parseFloat(purseStakingUserTotalReceipt)*100/purseStakingTotalReceipt).toLocaleString('en-US', { maximumFractionDigits: 5 })

    let purseStakingRemainingTime : number
    if(purseStakingUserLockTime === 0){
      purseStakingRemainingTime = 0
    }else{
      let newTime = Math.round(+new Date()/1000) - purseStakingUserLockTime
      if(newTime > purseStakingLockPeriod){
        purseStakingRemainingTime = 0
      }else{
        purseStakingRemainingTime = newTime
      }
    }
    const secondsToDhms = (seconds: number) => {
      seconds = purseStakingLockPeriod - Number(seconds);
      let d = Math.floor(seconds / (3600*24));
      let h = Math.floor(seconds % (3600*24) / 3600);
      let m = Math.floor(seconds % 3600 / 60);

      let dDisplay = d > 0 ? d + ("d ") : "";
      let hDisplay = h > 0 ? h + ("h ") : "";
      let mDisplay = m > 0 ? m + ("m ") : "";
      return seconds > 60 ? dDisplay + hDisplay + mDisplay : "< 1m";
    }

    let retroactiveAPR = (((
        (Constants.RETROACTIVE_INITIAL_REWARDS + Constants.RETROACTIVE_AUG23_REWARDS)
        / purseStakingTotalStake
        )/Constants.RETROACTIVE_PERIOD_DAYS
    ) * 365 * 100
    ).toLocaleString(
        'en-US',
        { maximumFractionDigits: 5 }
    );

    let combinedAPR = (
        parseFloat(purseStakingAPR) + parseFloat(retroactiveAPR)
    );

    return (
        <div id="content" className="mt-4">
          <label className="textWhite center mb-5" style={{fontSize:"40px", textAlign:"center"}}><big><b>PURSE Staking</b></big></label>
  
          {isActive ?
            <form className="mb-0" onSubmit={async (event) => {
              event.preventDefault()
            }}>
  
            <div className="rowC center">
              <div className="card cardbody" style={{ minWidth: '300px', width: "900px" }}>
  
              <ButtonGroup>
                <Button type="button" variant="ghost" style={{ color:"White", backgroundColor: mode==='Stake'?'#6A5ACD':'' }} onClick={(event) => {
                    setMode('Stake')
                }}>Stake&nbsp;&nbsp;
                  <ReactPopup trigger={open => (
                    <span style={{ position: "relative", top: '-1.5px' }}><BsFillQuestionCircleFill size={14} /></span>
                  )}
                    on="hover"
                    position="right center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '3px' }}>
                    <span className="textInfo"> Stake your PURSE to earn auto-compounding PURSE rewards over time</span>
                  </ReactPopup></Button>
  
                <Button type="button" variant="ghost" style={{ color:"White", backgroundColor: mode==='Unstake'?'#6A5ACD':''}} onClick={(event) => {
                  setMode('Unstake')
                }}>Unstake&nbsp;&nbsp;
                 <ReactPopup trigger={open => (
                    <span style={{ position: "relative", top: '-1.5px' }}><BsFillQuestionCircleFill size={14} /></span>
                  )}
                    on="hover"
                    position="bottom center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '3px' }}>
                    <span className="textInfo"> Unstake and earn PURSE rewards using your share</span>
                  </ReactPopup></Button>
  
                <Button type="button" variant="ghost" style={{ color:"White", backgroundColor: mode==='Check'?'#6A5ACD':'' }} onClick={(event) => {
                  setMode('Check')
                }}>Check&nbsp;&nbsp;
                <ReactPopup trigger={open => (
                   <span style={{ position: "relative", top: '-1.5px' }}><BsFillQuestionCircleFill size={14} /></span>
                 )}
                   on="hover"
                   position="left center"
                   offsetY={-23}
                   offsetX={0}
                   contentStyle={{ padding: '3px' }}>
                   <span className="textInfo"> Check your withdrawable PURSE using your share </span>
                 </ReactPopup></Button>
              </ButtonGroup>
  
              <div className="card-body">
  
                <div className="mb-4" style={{backgroundColor: "rgba(106, 90, 205, 0.2)", padding: "30px 40px"}}>
                  <div className="rowC textWhiteSmaller ml-2 mb-2">
                    <div><IoStar className='mb-1'/></div><div className="ml-2"><b>Rewards are tokens from BDL deducted from each PURSE token transaction</b></div>
                  </div>
                  <div className="rowC textWhiteSmaller ml-2 mb-2">
                    <div><IoStar className='mb-1'/></div><div className="ml-2"><b>The more PURSE you stake,&nbsp;&nbsp;the more you earn as PURSE is continuously compounding</b></div>
                  </div>
                  <div className="rowC textWhiteSmaller ml-2 mb-2">
                    <div><IoStar className='mb-1'/></div><div className="ml-2"><b>Earn automatically as the PURSE rewards appear under your Staked Balance periodically</b></div>
                  </div>
                  <div className="rowC textWhiteSmaller ml-2 mb-2">
                    <div><IoStar className='mb-1'/></div><div className="ml-2"><b>When you withdraw,&nbsp;&nbsp;you receive your original staked PURSE and PURSE rewards</b></div>
                  </div>
                </div>
  
                {stakeLoading ?
                  <div>
                    {purseStakingUserWithdrawReward>0 ?
                      <div>
                        {purseStakingRemainingTime>0 ?
                          <div className='mb-3 textWhiteSmall' style={{borderBottom:"1px solid grey"}}>
                            <div className='row ml-2 mb-1'>
                              <div style={{width:"50%", minWidth:"250px"}}>
                                <div className='mb-1'>PURSE Locked For 21 Days:&nbsp;&nbsp;
                                  <ReactPopup trigger={open => (
                                    <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                                    )}
                                    on="hover"
                                    position="top center"
                                    offsetY={20}
                                    offsetX={0}
                                    contentStyle={{ padding: '3px' }}>
                                    <span className="textInfo">PURSE locked during these 21 days will not earn any rewards</span>
                                  </ReactPopup>
                                </div>
                                <div className="mb-3" style={{ color : "#B0C4DE" }}><b>{(purseStakingUserWithdrawReward).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " PURSE"}</b></div>
                              </div>
                              <div style={{width:"50%", minWidth:"250px"}}>
                                <div className="mb-1">Remaining Lock Time:</div>
                                <div className="mb-3" style={{ color : "#B0C4DE" }}><MdLockClock/>&nbsp;&nbsp;<b>{secondsToDhms(purseStakingRemainingTime)}</b></div>
                              </div>
                            </div>
                          </div>
                        :
                          <div className='mb-3 textWhiteSmall' style={{borderBottom:"1px solid grey"}}>
                            <div className='row ml-2 mb-1'>
                              <div style={{width:"50%", minWidth:"250px"}}>
                                <div className='mb-1'>Withdrawable PURSE:&nbsp;&nbsp;
                                  <ReactPopup trigger={open => (
                                    <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                                    )}
                                    on="hover"
                                    position="top center"
                                    offsetY={20}
                                    offsetX={0}
                                    contentStyle={{ padding: '3px' }}>
                                    <span className="textInfo mb-2">Click the button below to withdraw the PURSE</span>
                                    <span className="textInfo">If not it will automatically be withdrawn when unstake</span>
                                  </ReactPopup>
                                </div>
                                <div className="mb-3" style={{ color : "#B0C4DE" }}><b>{(purseStakingUserWithdrawReward).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " PURSE"}</b></div>
                                <Button type="button" className="btn btn-sm mb-3" variant="outline-success" onClick={(event) => {
                                  withdrawLocked()
                                }}>Withdraw</Button>
                              </div>
                              <div style={{width:"50%", minWidth:"250px"}}>
                                <div className="mb-1">Remaining Lock Time:</div>
                                <div className="mb-2" style={{ color : "#B0C4DE" }}><b>21-Day Lock is over</b></div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    :
                      <div></div>
                    }
    
                    <div className="row ml-2">
                      <div style={{width:"50%", minWidth:"250px"}}>
                        <div className="textWhiteSmall mb-1">
                          <b>Address:</b>
                        </div>
                          <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                            <b>{account}</b>
                          </div>
                          <div className="textWhiteSmall mb-1">
                            <b>PURSE Balance:</b>
                          </div>
                          <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                            <b>{parseFloat(purseTokenUpgradableBalance.toString()).toLocaleString(
                                    'en-US', { maximumFractionDigits: 5 }) + " PURSE"}
                            </b>
                          </div>
                          <div className="textWhiteSmall mb-1" >
                            <b>Staked Balance:&nbsp;&nbsp;</b>
                            <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Amount of PURSE user has staked + PURSE reward from PURSE Distribution</span>
                            </ReactPopup>
                          </div>
                          <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                            <b>
                              {purseStakingUserStake?.toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " PURSE (" + (
                                      (purseStakingUserStake)*PURSEPrice).toLocaleString(
                                          'en-US', { maximumFractionDigits: 5 }) + " USD)"}
                            </b>
                          </div>
                          <div className="textWhiteSmall mb-1" >
                            <b>Share Balance:&nbsp;&nbsp;</b>
                            <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Represents the amount of PURSE the user owns in the PURSE Staking contract</span>
                              <span className="textInfo mt-2">Staked Balance = Share Balance / Total Share (Pool) x Total Staked (Pool)</span>
                            </ReactPopup>
                          </div>
                          <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                            <b>
                              {parseFloat(purseStakingUserTotalReceipt.toString()).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " Share (" + sharePercent2 + " %)"}
                            </b>
                          </div>
                          <div className="textWhiteSmaller"><RiArrowRightFill/>
                            <b style={{textDecoration:"underline grey"}}> Unlocked Share</b>&nbsp;&nbsp;
                            <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Share received previously when staked into contract before the 21-Day Lock implementation</span>
                            </ReactPopup>
                          </div>
                          <div className="textWhiteSmall ml-3 mb-2" style={{ color : "#B0C4DE" }}>
                            <b>{(purseStakingUserReceipt).toLocaleString(
                                    'en-US', { maximumFractionDigits: 5 })+ " Share (" + sharePercent + " %)"}
                            </b>
                          </div>
                          <div className="textWhiteSmaller"><RiArrowRightFill/>
                            <b style={{textDecoration:"underline grey"}}> Locked Share</b>&nbsp;&nbsp;
                            <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Locked share received when staked into contract after the 21-Day Lock implementation</span>
                            </ReactPopup>
                          </div>
                          <div className="textWhiteSmall ml-3 mb-3" style={{ color : "#B0C4DE" }}>
                            <b>
                              {(purseStakingUserNewReceipt).toLocaleString(
                                'en-US', { maximumFractionDigits: 5 })+ " Share (" + sharePercent1 + " %)"}
                            </b>
                          </div>
                      </div>
    
                      <div style={{width:"50%", minWidth:"250px"}}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div>
                            <div className="textWhiteSmall mb-1" >
                              <b>APR:&nbsp;&nbsp;</b>
                              <ReactPopup
                                  trigger={open => (
                                      <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                                  )}
                                  on="hover"
                                  position="right center"
                                  offsetY={-23}
                                  offsetX={0}
                                  contentStyle={{ padding: '3px' }}
                              >
                                <span className="textInfo">
                                  Percentage of past 30 days distribution sum x 12 / Total staked (Pool) + <br/>
                                  Percentage of total rewards disbursed and to disburse / Total staked (Pool)
                                </span>
                              </ReactPopup>
                            </div>
                            <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                              <b>
                                {
                                  isNaN(combinedAPR) ?
                                      "0 %" :
                                      `${combinedAPR.toLocaleString('en-US', { maximumFractionDigits: 5 })} %`
                                }
                              </b>
                            </div>
                          </div>
                        </div>
                        <div style={{paddingRight:"2px", width:"50%", minWidth:"250px"}}>
                          <div className="textWhiteSmall mb-1"><b>Past 30 Days Distribution Sum:</b></div>
                          <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}><b>{(sum30TransferAmount).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " PURSE"}</b></div>
                        </div>
                        <div className="textWhiteSmall mb-1" >
                          <b>Total Staked (Pool):&nbsp;&nbsp;</b>
                          <ReactPopup trigger={open => (
                            <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                            )}
                            on="hover"
                            position="top center"
                            offsetY={20}
                            offsetX={0}
                            contentStyle={{ padding: '3px' }}>
                            <span className="textInfo">Total PURSE amount in the PURSE Staking contract</span>
                            <span className="textInfo mt-2">Calculated based on PURSE staked by PURSE holders + PURSE Distribution</span>
                          </ReactPopup>
                        </div>
                        <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                          <b>{(
                              purseStakingTotalStake).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " PURSE (" + (
                                      (purseStakingTotalStake)*PURSEPrice).toLocaleString(
                                          'en-US', { maximumFractionDigits: 5 }) + " USD)"}
                          </b>
                        </div>
                          <div className="textWhiteSmall mb-1" >
                            <b>Total Share (Pool):&nbsp;&nbsp;</b>
                            <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Represents the total amount of PURSE in the PURSE Staking contract</span>
                              <span className="textInfo mt-2">Total Share (Pool) ≡ Total Staked (Pool)</span>
                            </ReactPopup>
                          </div>
                          <div className="textWhiteSmall mb-3" style={{ color : "#B0C4DE" }}>
                            <b>
                              {(purseStakingTotalReceipt).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " Share (100%)"}
                            </b>
                          </div>
                      </div>
                    </div>
    
                  {purseMessage?
                  <div>
                    <div style={{borderTop:"1px solid grey"}}></div>
                    <div>
                      <div className="textWhiteSmall mt-3 ml-2 mb-2">
                        <b>PURSE Staking:</b>
                      </div>
                      <div className="textWhiteSmaller ml-2" style={{textDecoration:"underline grey"}}>
                        <b>No 21-Day Lock</b>
                          <ReactPopup trigger={open => (
                            <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                            )}
                            on="hover"
                            position="top center"
                            offsetY={20}
                            offsetX={0}
                            contentStyle={{ padding: '3px' }}>
                            <span className="textInfo">No 21-Day Lock: If unstake using Unlocked Share, PURSE will be transferred instantly to user</span>
                          </ReactPopup>
                      </div>
                      <div className="textWhiteSmall ml-2 mb-2" style={{ color : "#B0C4DE" }}>
                        <b>{purseAmount}</b>
                      </div>
                      <div className="textWhiteSmaller ml-2" style={{textDecoration:"underline grey"}}>
                        <b>With 21-Day Lock</b>
                          <ReactPopup trigger={open => (
                            <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                            )}
                            on="hover"
                            position="top center"
                            offsetY={20}
                            offsetX={0}
                            contentStyle={{ padding: '3px' }}>
                            <span className="textInfo mt-2">With 21-Day Lock: If unstake using Locked Share, PURSE can only be withdrawn after 21 days</span>
                          </ReactPopup>
                      </div>
                      <div className="textWhiteSmall ml-2 mb-2" style={{ color : "#B0C4DE" }}>
                        <b>{rewardAmount}</b>
                      </div>
                    </div>
                  </div>
                  :
                    <div></div>
                  }
                    
                  </div>
                :
                  <div className='center' style={{padding: "95px 0px"}}><ReactLoading type={"spin"} height={100} width={100}/></div>
                }
              </div>
  
              {purseStakingUserAllowance > 100000000000000000000000000000?
                <div>
                  {stakeLoading ?
                  <div>
                    <div className="center">
                      <div className="input-group mb-0" style={{width: "95%"}} >
                        <input
                          type="text"
                          onPaste={(event)=>{
                            event.preventDefault()
                          }}
                          style={{ color: "#B0C4DE", backgroundColor: "#28313B" }}
                          className="form-control cardbody"
                          placeholder="0"
                          onChange={(e) => {
                            const value = e.target.value;
                            onChangeHandler(value)
                          }}
                          value={amount}
                          required
                        />
                        <div className="input-group-append">
                          <div className="input-group-text cardbody center" style={{ color: "#B0C4DE", width: "80px" }}>{mode==='Stake'?'PURSE':'Share'} </div>
                        </div>
                      </div >
                    </div>
                  <div className="ml-4" style={{ color: "#DC143C" }}>{message} </div>
  
                  <div className="center mt-3 mb-3">
                    <ButtonGroup>
                      <Button type="submit" style={{ width : "140px" }} onClick={async(event) => {
                        if (amount!==''&&amount!=='0.0'){
                            if (mode==='Stake') {
                                await onClickHandlerDeposit()
                            } else if (mode==='Unstake') {
                                await onClickHandlerWithdraw()
                            } else if (mode==='Check'){
                                await onClickHandlerCheck()
                            }
                        }
                      }}>{mode}</Button>
  
                      <Button type="button" variant="outline-primary" style={{ width : "140px" }} onClick={(event) => {
                        if (mode==='Stake') {
                            onChangeHandler(purseTokenUpgradableBalance.toString())
                        } else if (mode==='Unstake') {
                            onChangeHandler(purseStakingUserTotalReceipt)
                        } else if (mode==='Check'){
                            onChangeHandler(purseStakingUserTotalReceipt)
                        }
                      }}>Max</Button>
                    </ButtonGroup>
                  </div>
                  {mode === "Unstake"?
                  <div className='center textWhite mb-3'>
                    <div style={{color:"silver", width:"90%", textAlign:"center", fontSize:"12px", backgroundColor: "rgba(106, 90, 205, 0.2)", padding:"8px"}}>
                      <AiFillAlert className='mb-1'/>&nbsp;Disclaimer: If unstake when there's an existing unstaking entry locked for &lt; 21-Day, the lock period will reset back to 21-Day
                    </div>
                  </div>
                  :
                  <div></div>}
                  </div>
                  : <div></div>}
                </div>
              :
                <div className="center">
                  {stakeLoading ?
                  <button type="button" className="btn btn-primary btn-block" onClick={(event) => {
                      approvePurse()
                  }}>Approve</button>
                  : <div></div>}
                </div>
                }
              </div>
  
            </div>
            </form>
          :
            <div className="center">
              <div className="card cardbody" style={{ minWidth: '300px', width: '900px', height: '200px', color: "White" }}>
                <div className="card-body">
                  <div>
                    <div className="center textWhiteMedium mt-3 mb-3" style={{textAlign:"center"}}>
                      <b>Connect wallet to stake PURSE</b>
                    </div>
                    <div className="center">
                      <button type="button" className="btn btn-primary mt-3" onClick={()=>setTrigger(true)}> Connect </button>
                    </div>
                  </div>
                </div>
              </div>
              <ConnectWallet trigger={trigger} setTrigger={setTrigger}/>
            </div>
          }
        </div>
    );
}

