import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import {Popup as ReactPopup} from 'reactjs-popup';
import { BsFillQuestionCircleFill, BsInfoCircleFill } from 'react-icons/bs'
import { IoStar } from 'react-icons/io5'
import { MdLockClock } from 'react-icons/md'
import { AiFillAlert } from 'react-icons/ai'
import { RiArrowRightFill } from 'react-icons/ri'
import * as Constants from "../../constants";
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { fetcher, callContract, formatBigNumber, isSupportedChain, getShortTxHash, secondsToDhms } from '../utils'

import '../App.css';
import { useWeb3React } from '@web3-react/core'
import { Loading } from '../Loading';
import useSWR from 'swr'
import { useToast } from '../state/toast/hooks';
import { useProvider } from '../state/provider/hooks';
import { usePursePrice } from '../state/PursePrice/hooks';
import { useContract } from '../state/contract/hooks';
import { useWalletTrigger } from '../state/walletTrigger/hooks';
import { useNetwork } from '../state/network/hooks';

export default function Stake() {
    const {isActive, chainId, account } = useWeb3React()
    const [,switchNetwork] = useNetwork()
    const [PURSEPrice] = usePursePrice()
    const {signer} = useProvider()
    const [,showToast] = useToast()

    const {purseStaking,purseTokenUpgradable} = useContract()

    const [mode, setMode] = useState('Stake')
    const [amount, setAmount] = useState('')
    const [message, setMessage] = useState('')
    const [purseMessage, setPurseMessage] = useState(false)
    const [purseAmount, setPurseAmount] = useState('')
    const [rewardAmount, setRewardAmount] = useState('')
    const [purseStakingUserReceipt, setPurseStakingUserReceipt] = useState<BigNumber>(BigNumber.from('0'))
    const [purseStakingUserNewReceipt, setPurseStakingUserNewReceipt] = useState<BigNumber>(BigNumber.from('0'))
    const [purseStakingUserWithdrawReward, setPurseStakingUserWithdrawReward] = useState(0)
    const [purseStakingRemainingTime, setPurseStakingRemainingTime] = useState(0)
    const [purseStakingLockPeriod, setPurseStakingLockPeriod] = useState(0)
    const [stakeLoading, setStakeLoading] = useState(false)
    const [sum30TransferAmount, setSum30TransferAmount] = useState(0)
    const [, setTrigger] = useWalletTrigger()
    const [isLoading, setIsLoading] = useState(true)
    const [valid, setValid] = useState(false)
    
    const {data:purseStakingTotalStake} = useSWR({
      contract:"purseTokenUpgradable",
      method:"balanceOf",
      params:[Constants.PURSE_STAKING_ADDRESS]
    },{
      fetcher: fetcher(purseTokenUpgradable),
      refreshInterval:5000
    })

    const {data:purseTokenUpgradableBalance} = useSWR({
      contract:"purseTokenUpgradable",
      method:"balanceOf",
      params:[account]
    },{
      fetcher: fetcher(purseTokenUpgradable),
      refreshInterval:5000
    })

    const {data:purseStakingUserAllowance} = useSWR({
      contract:"purseTokenUpgradable",
      method:"allowance",
      params:[account,Constants.PURSE_STAKING_ADDRESS]
    },{
      fetcher: fetcher(purseTokenUpgradable),
      refreshInterval:5000
    })

    const {data:purseStakingTotalReceipt} = useSWR({
      contract:"purseStaking",
      method:"totalReceiptSupply",
      params:[]
    },{
      fetcher: fetcher(purseStaking),
      refreshInterval:5000
    })

    const {data:purseStakingUserStake} = useSWR({
      contract:"purseStaking",
      method:"getTotalPurse",
      params:[account]
    },{
      fetcher: fetcher(purseStaking),
      refreshInterval:5000
    })

    const {data:purseStakingUserInfo} = useSWR({
      contract:"purseStaking",
      method:"userInfo",
      params:[account]
    },{
      fetcher: fetcher(purseStaking),
      refreshInterval:5000
    })

    useEffect(()=>{
      if (purseStakingUserInfo){
        let _purseStakingUserReceipt = purseStakingUserInfo[0]
        setPurseStakingUserReceipt(_purseStakingUserReceipt)
  
        let _purseStakingUserNewReceipt = purseStakingUserInfo[1]

        setPurseStakingUserNewReceipt(_purseStakingUserNewReceipt)
  
        let _purseStakingUserWithdrawReward = purseStakingUserInfo[2]
        setPurseStakingUserWithdrawReward(parseFloat(formatUnits(_purseStakingUserWithdrawReward,'ether')))
  
        let _purseStakingUserLockTime = parseFloat(purseStakingUserInfo[3].toString())
      
        let _purseStakingRemainingTime: number
        if(_purseStakingUserLockTime === 0){
          _purseStakingRemainingTime = 0
        }else{
          let newTime = Math.round(+new Date()/1000) - _purseStakingUserLockTime
          if(newTime > purseStakingLockPeriod){
            _purseStakingRemainingTime = 0
          }else{
            _purseStakingRemainingTime = newTime
          }
        }
        setPurseStakingRemainingTime(_purseStakingRemainingTime)
      }
    },[purseStakingUserInfo,purseStakingLockPeriod])

    useEffect(()=>{
      async function loadData(){
        let _purseStakingLockPeriod = await purseStaking.lockPeriod()
        setPurseStakingLockPeriod(parseFloat(_purseStakingLockPeriod.toString()))

        let response = await fetch(Constants.MONGO_RESPONSE_0_API);
        let myJson = await response.json()
        let _sum30TransferAmount = myJson["Transfer30Days"][0]
        setSum30TransferAmount(parseFloat(formatUnits(_sum30TransferAmount,'ether')))

        setIsLoading(false)
      }
      loadData()
    },[account, purseStaking])

    const onChangeHandler = (event:string) => {
        setAmount(event)
        const amountRegex = /^\d+(\.\d{1,18})?$/
        let result = amountRegex.test(event)
        if (event===""){
          setMessage("")
        } else if(!result) {
          setMessage("Not a valid number")
        } else {
          setMessage("")
        }
        setValid(result)
        if (parseFloat(event)<=0){
          setMessage("Value needs to be greater than 0")
          setValid(false)
        }
    }

    const onClickHandlerDeposit = async () => {
        let amountWei = parseUnits(amount, 'ether')
        if (amountWei.gt(purseTokenUpgradableBalance)) {
          showToast("Insufficient PURSE to stake!","failure")
        } else {
            await stake(amountWei)
        }
    }

    const onClickHandlerWithdraw = async () => {
        let receiptWei = parseUnits(amount, 'ether')
        if ( receiptWei.gt(purseStakingUserTotalReceipt) ) {
          showToast("Insufficient Share to unstake!","failure")
        } else {
            await unstake(receiptWei)
        }
    }

    const onClickHandlerCheck = async () => {
        let receiptWei = parseUnits(amount, 'ether')

        if (receiptWei.gt(purseStakingUserTotalReceipt)) {
          showToast("Insufficient Share to withdraw!","failure")
        } else {
            setPurseMessage(true)
            let _checkPurseAmount:string[] = await checkPurseAmount(receiptWei)
            let getPurseAmount = _checkPurseAmount[0] + " Share : " + parseFloat(_checkPurseAmount[3]).toLocaleString('en-US', { maximumFractionDigits: 5 })  + " PURSE (" + (parseFloat(_checkPurseAmount[3])*PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"
            let getRewardAmount = _checkPurseAmount[1] + " Share : " + parseFloat(_checkPurseAmount[2]).toLocaleString('en-US', { maximumFractionDigits: 5 })   + " PURSE (" + (parseFloat(_checkPurseAmount[2])*PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"
            setPurseAmount(getPurseAmount)
            setRewardAmount(getRewardAmount)
        }
    }

    const stake = async (amount:BigNumber) => {
      if (isActive) {
        if (amount.gt(purseStakingUserAllowance)){
          await approvePurse()
        }
        setStakeLoading(true)
        try{
          const tx:any = await callContract(signer,purseStaking,"enter",amount)
          onChangeHandler('')
          if (tx?.hash){
            const link = `https://bscscan.com/tx/${tx.hash}`
            showToast("Transaction sent!","success",link)
            await tx.wait()
            const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(tx.hash)}`
            showToast(message,"success",link)
          }else if(tx?.message.includes("user rejected transaction")){
            showToast(`User rejected transaction.`,"failure")
          }else if(tx?.reason){
            showToast(`Execution reverted: ${tx.reason}`,"failure")
          }else {
            showToast("Something went wrong.","failure")
          }
        } catch(err) {
          showToast("Something went wrong.","failure")
          console.log(err)
        }
        
        setStakeLoading(false)
      }
    }

    const unstake = async (receipt:BigNumber) => {
      if (isActive) {
        setStakeLoading(true)
        try{
          const tx:any = await callContract(signer,purseStaking,"leave",receipt)
          onChangeHandler('')
          if (tx?.hash){
            const link = `https://bscscan.com/tx/${tx.hash}`
            showToast("Transaction sent!","success",link)
            await tx.wait()
            const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(tx.hash)}`
            showToast(message,"success",link)
          }else if(tx?.message.includes("user rejected transaction")){
            showToast(`User rejected transaction.`,"failure")
          }else if(tx?.reason){
            showToast(`Execution reverted: ${tx.reason}`,"failure")
          }else {
            showToast("Something went wrong.","failure")
          }
        } catch(err) {
          showToast("Something went wrong.","failure")
          console.log(err)
        }
        
        setStakeLoading(false)
      }
    }

    const withdrawLocked = async () => {
      if (isActive) {
        setStakeLoading(true)
        try{
          const tx:any = await callContract(signer,purseStaking,"withdrawLockedAmount")
          if (tx?.hash){
            const link = `https://bscscan.com/tx/${tx.hash}`
            showToast("Transaction sent!","success",link)
            await tx.wait()
            const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(tx.hash)}`
            showToast(message,"success",link)
          }else if(tx?.message.includes("user rejected transaction")){
            showToast(`User rejected transaction.`,"failure")
          }else if(tx?.reason){
            showToast(`Execution reverted: ${tx.reason}`,"failure")
          }else {
            showToast("Something went wrong.","failure")
          }
        } catch(err) {
          showToast("Something went wrong.","failure")
          console.log(err)
        }
        
        setStakeLoading(false)
      }
    }

    const approvePurse = async () => {
      if (isActive) {
        try{
          const tx:any = await callContract(signer,purseTokenUpgradable,"approve",Constants.PURSE_STAKING_ADDRESS, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
          if (tx?.hash){
            const link = `https://bscscan.com/tx/${tx.hash}`
            showToast("Transaction sent!","success",link)
            await tx.wait()
            const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(tx.hash)}`
            showToast(message,"success",link)
          }else if(tx?.message.includes("user rejected transaction")){
            showToast(`User rejected transaction.`,"failure")
          }else if(tx?.reason){
            showToast(`Execution reverted: ${tx.reason}`,"failure")
          }else {
            showToast("Something went wrong.","failure")
          }
        } catch(err) {
          showToast("Something went wrong.","failure")
          console.log(err)
        }
        
      }
    }

    const claim = async () => {
      if (isActive) {
        setStakeLoading(true)
        try{
          // const tx:any = await callContract(signer,purseStaking,"withdrawLockedAmount")
          // if (tx?.hash){
          //   const link = `https://bscscan.com/tx/${tx.hash}`
          //   showToast("Transaction sent!","success",link)
          //   await tx.wait()
          //   const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(tx.hash)}`
          //   showToast(message,"success",link)
          // }else if(tx?.message.includes("user rejected transaction")){
          //   showToast(`User rejected transaction.`,"failure")
          // }else if(tx?.reason){
          //   showToast(`Execution reverted: ${tx.reason}`,"failure")
          // }else {
          //   showToast("Something went wrong.","failure")
          // }
        } catch(err) {
          showToast("Something went wrong.","failure")
          console.log(err)
        }
        
        setStakeLoading(false)
      }
    }
    
    const checkPurseAmount = async (receipt:BigNumber) => {
      let _purseStakingAvailableSupply:BigNumber = await purseStaking.availablePurseSupply()
      let _purseStakingTotalReceipt:BigNumber = await purseStaking.totalReceiptSupply()
      let receiptToken:BigNumber = purseStakingUserReceipt
      let newArray:string[]
      let _receipt = parseFloat(formatUnits(receipt, 'ether'))
      if(receiptToken.lte(0)) {
        let purseReward = receipt.mul(_purseStakingAvailableSupply).div(_purseStakingTotalReceipt??1)
        newArray = ['0', _receipt.toString(), formatBigNumber(purseReward,'ether').toString(),'0']
      } else {
        if(receipt.gt(receiptToken)) {
          let newReceipt = receipt.sub(receiptToken)
          let purseReward = newReceipt.mul(_purseStakingAvailableSupply).div(_purseStakingTotalReceipt??1)

          let purse = receiptToken.mul(_purseStakingAvailableSupply).div(_purseStakingTotalReceipt??1)
          newArray = [formatBigNumber(receiptToken,'ether'), formatBigNumber(newReceipt,'ether') ,formatBigNumber(purseReward,'ether'), formatBigNumber(purse,'ether')]
        } else {
          let purse = receipt.mul(_purseStakingAvailableSupply).div(_purseStakingTotalReceipt??1)
          newArray = [_receipt.toString(), '0', '0', formatBigNumber(purse,'ether')]
        }
      }
      return newArray
    }

    let purseStakingAPR = (sum30TransferAmount*12*100/parseFloat(formatBigNumber(purseStakingTotalStake,'ether'))).toLocaleString('en-US', { maximumFractionDigits: 5 })
    let purseStakingUserTotalReceipt = (purseStakingUserReceipt).add(purseStakingUserNewReceipt)

    let unlockSharePercent = ((Number(purseStakingUserReceipt)/Number(purseStakingTotalReceipt??1))*100).toLocaleString('en-US', { maximumFractionDigits: 5 })
    let lockSharePercent = ((Number(purseStakingUserNewReceipt)/Number(purseStakingTotalReceipt??1))*100).toLocaleString('en-US', { maximumFractionDigits: 5 })
    let balanceSharePercent = ((Number(purseStakingUserTotalReceipt)/Number(purseStakingTotalReceipt??1))*100).toLocaleString('en-US', { maximumFractionDigits: 5 })

    let retroactiveAPR = (((
        (Constants.RETROACTIVE_INITIAL_REWARDS + Constants.RETROACTIVE_AUG23_REWARDS)
        / parseFloat(formatBigNumber(purseStakingTotalStake,'ether'))
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
          {!isActive?
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
          </div>
          :
          !isSupportedChain(chainId)?
            <div className="center">
            <div className="card cardbody" style={{ minWidth: '300px', width: '900px', height: '200px', color: "White" }}>
              <div className="card-body">
                <div>
                  <div className="center textWhiteMedium mt-3 mb-3" style={{textAlign:"center"}}>
                    <b>Switch chain to stake PURSE</b>
                  </div>
                  <div className="center">
                    <button type="button" className="btn btn-primary mt-3" onClick={()=>switchNetwork()}> Switch </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          :
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
                                <div className="mb-3" style={{ color : "#B0C4DE" }}><MdLockClock/>&nbsp;&nbsp;<b>{secondsToDhms(purseStakingLockPeriod,purseStakingRemainingTime)}</b></div>
                              </div>
                            </div>
                          </div>
                        :
                        isLoading?
                        <Loading/>
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
                                <Button type="button" className="btn btn-sm mb-3" variant="outline-success" disabled={stakeLoading} onClick={(event) => {
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
                            {isLoading?
                            <Loading/>
                            :
                            <b>{parseFloat(formatBigNumber(purseTokenUpgradableBalance,'ether')).toLocaleString(
                              'en-US', { maximumFractionDigits: 5 }) + " PURSE"}
                            </b>
                            }
                          </div>
                          
                          <div className="textWhiteSmall mb-1" >
                            <b>Reward:&nbsp;&nbsp;</b>
                            {/* <ReactPopup trigger={open => (
                              <span style={{ position: "relative", top: '-1.5px' }}><BsInfoCircleFill size={10}/></span>
                              )}
                              on="hover"
                              position="top center"
                              offsetY={20}
                              offsetX={0}
                              contentStyle={{ padding: '3px' }}>
                              <span className="textInfo">Represents the total amount of PURSE in the PURSE Staking contract</span>
                              <span className="textInfo mt-2">Total Share (Pool) ≡ Total Staked (Pool)</span>
                            </ReactPopup> */}
                          </div>
                          <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                          {isLoading?
                            <Loading/>
                            :
                            <b>
                              {/* {parseFloat(formatBigNumber(purseStakingTotalReceipt,'ether')).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })} */}
                              0 PURSE
                            </b>
                          }
                          </div>
                          <Button type="button" className="btn btn-sm mb-3" variant="outline-success" disabled onClick={(event) => {
                                  claim()
                                }}>Claim</Button>
                          
                      </div>
    
                      <div style={{width:"50%", minWidth:"250px"}}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div>
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
                          {isLoading?
                            <Loading/>
                            :
                            <b>
                              {parseFloat(formatBigNumber(purseStakingUserStake,'ether')).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " PURSE (" + (
                                    parseFloat(formatBigNumber(purseStakingUserStake,'ether'))*PURSEPrice).toLocaleString(
                                          'en-US', { maximumFractionDigits: 5 }) + " USD)"}
                            </b>
                          }
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
                          {isLoading?
                            <Loading/>
                            :
                            <b>
                              {parseFloat(formatBigNumber(purseStakingUserTotalReceipt,'ether').toString()).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " Share (" + balanceSharePercent + " %)"}
                            </b>
                          }
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
                          {isLoading?
                            <Loading/>
                            :
                            <b>{parseFloat(formatBigNumber(purseStakingUserReceipt,'ether')).toLocaleString(
                                    'en-US', { maximumFractionDigits: 5 })+ " Share (" + unlockSharePercent + " %)"}
                            </b>
                          }
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
                          {isLoading?
                            <Loading/>
                            :
                            <b>
                              {parseFloat(formatBigNumber(purseStakingUserNewReceipt,'ether')).toLocaleString(
                                'en-US', { maximumFractionDigits: 5 })+ " Share (" + lockSharePercent + " %)"}
                            </b>
                          }
                          </div>

                          </div>
                        </div>
                          
                      </div>
                    </div>

                    <div style={{borderTop:"1px solid grey"}}></div>
                    <div className="row mt-3 ml-2">
                      
                      <div style={{width:"50%", minWidth:"250px"}}>

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
                          {isLoading?
                          <Loading/>
                          :
                            <b>
                              {
                                isNaN(combinedAPR) ?
                                    "0 %" :
                                    `${combinedAPR.toLocaleString('en-US', { maximumFractionDigits: 5 })} %`
                              }
                            </b>
                          }
                          </div>
                        </div>
                          
                        <div style={{paddingRight:"2px", width:"50%", minWidth:"250px"}}>
                          <div className="textWhiteSmall mb-1"><b>Past 30 Days Distribution Sum:</b></div>
                          <div className="textWhiteSmall mb-2" style={{ color : "#B0C4DE" }}>
                          {isLoading?
                            <Loading/>
                            :
                            <b>{(sum30TransferAmount).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " PURSE"}</b>
                          }
                          </div>
                        </div>

                      </div>
    
                      <div style={{width:"50%", minWidth:"250px"}}>

                        
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
                        {isLoading?
                            <Loading/>
                            :
                          <b>{parseFloat(
                              formatBigNumber(purseStakingTotalStake,'ether')).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " PURSE (" + (
                                    parseFloat(formatBigNumber(purseStakingTotalStake,'ether'))*PURSEPrice).toLocaleString(
                                          'en-US', { maximumFractionDigits: 5 }) + " USD)"}
                          </b>
                        }
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
                          {isLoading?
                            <Loading/>
                            :
                            <b>
                              {parseFloat(formatBigNumber(purseStakingTotalReceipt,'ether')).toLocaleString(
                                  'en-US', { maximumFractionDigits: 5 })+ " Share (100%)"}
                            </b>
                          }
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
                
              </div>
  

                <div>
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
                          disabled={stakeLoading}
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
                      <Button type="submit" style={{ width : "140px" }} disabled={stakeLoading} onClick={async(event) => {
                        if (valid){
                            if (mode==='Stake') {
                                await onClickHandlerDeposit()
                            } else if (mode==='Unstake') {
                                await onClickHandlerWithdraw()
                            } else if (mode==='Check'){
                                await onClickHandlerCheck()
                            }
                        }
                      }}>{stakeLoading?<Loading/>:mode}</Button>
  
                      <Button type="button" variant="outline-primary" style={{ width : "140px" }} disabled={stakeLoading} onClick={(event) => {
                        if (mode==='Stake') {
                            onChangeHandler(formatBigNumber(purseTokenUpgradableBalance,'ether'))
                        } else if (mode==='Unstake') {
                            onChangeHandler(formatBigNumber(purseStakingUserTotalReceipt,'ether'))
                        } else if (mode==='Check'){
                            onChangeHandler(formatBigNumber(purseStakingUserTotalReceipt,'ether'))
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
                </div>

              </div>
  
            </div>
            </form>
          }
        </div>
    );
}

