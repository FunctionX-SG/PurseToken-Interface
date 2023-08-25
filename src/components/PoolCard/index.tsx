import React, { useState } from "react";
import '../App.css';
import purse from '../../assets/images/purse.png'
import { Loading } from '../Loading';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import {Popup as ReactPopup} from 'reactjs-popup';
import Popup from '../Popup'
import Buttons from 'react-bootstrap/Button'
import Deposit from "../Deposit";
import useSWR from 'swr'
import RestakingFarm from '../../abis/RestakingFarm.json'
import IPancakePair from '../../abis/IPancakePair.json'
import PurseTokenUpgradable from '../../abis/PurseTokenUpgradable.json'
import { useWeb3React } from '@web3-react/core'
import { callContract, formatBigNumber, getShortTxHash, isSupportedChain, fetcher } from '../utils'
import { ethers } from "ethers";
import * as Constants from "../../constants"

export default function PoolCard(props:any){
    const {
        pairName,
        aprloading,
        apr,
        apyDaily,
        apyWeekly,
        apyMonthly,
        poolInfo,
        userInfo,
        isUserLoading,
        tvl,
        bscProvider,
        signer,
        triggerWallet,
        setTriggerWallet,
        switchNetwork,
        showToast,
    } = props
    const {account,isActive,chainId} = useWeb3React()
    const [trigger,setTrigger] = useState(false)
    const [isHarvest,setIsHarvest] = useState(false)
    const lpTokenAddress = poolInfo.lpAddresses[chainId?.toString() as keyof typeof poolInfo.lpAddresses]

    const restakingFarm = new ethers.Contract(Constants.RESTAKING_FARM_ADDRESS, RestakingFarm.abi, bscProvider)
    const purseTokenUpgradable = new ethers.Contract(Constants.PURSE_TOKEN_UPGRADABLE_ADDRESS, PurseTokenUpgradable.abi, bscProvider)
    const pancakeContract = new ethers.Contract(Constants.PANCAKE_PAIR_ADDRESS, IPancakePair.abi, bscProvider)
    const {data:purseEarned} = useSWR({
        contract:"restakingFarm",
        method:"pendingReward",
        params:[lpTokenAddress,account]
    },{
        fetcher: fetcher(restakingFarm),
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

    const {data:lpStaked} = useSWR({
        contract:"restakingFarm",
        method:"userInfo",
        params:[lpTokenAddress,account]
    },{
        fetcher: fetcher(restakingFarm),
        refreshInterval:5000
    })

    const {data:stakedBalance} = useSWR({
        contract:"pancakeContract",
        method:"balanceOf",
        params:[Constants.RESTAKING_FARM_ADDRESS]
    },{
        fetcher: fetcher(pancakeContract),
        refreshInterval:5000
    })

    const harvest = async () => {
        if (!isActive) {
            showToast("Connect wallet to try again.","warning")
            await setTriggerWallet(true)
        } else {
            if (!isSupportedChain(chainId)) {
                showToast("Switch chain to try again.","warning")
                await switchNetwork()
            } else if (isActive && poolInfo && chainId) {
                try{
                    const tx:any = await callContract(signer,restakingFarm,"claimReward",poolInfo.lpAddresses[chainId])
                    if (tx?.hash){
                        const link = `https://bscscan.com/tx/${tx.hash}`
                        showToast("Transaction sent!","success",link)
                        await tx.wait()
                        const message = `Transaction confirmed!\nTransaction Hash: ${getShortTxHash(tx.hash)}`
                        showToast(message,"success",link)
                    }else if(tx?.message.includes("user rejected transaction")){
                        showToast(`User rejected transaction.`,"failure")
                    }else {
                        showToast("Something went wrong.","failure")
                    }
                } catch(err) {
                    showToast("Something went wrong.","failure")
                    console.log(err)
                }
                
            } else {
                setTriggerWallet(true)
            }
        }
    }

    

    return (
        <div>
        <div>
            <div className="col">
                <div className="card mb-4 cardbody card-body text-center" style={{ maxWidth: '230px', color: 'white' }}>
                    <span>
                        <img src={purse} height='30' alt="" /><br />
                        <b className="text">{pairName}</b>
                        <div>
                            <div className=""><small>Deposit<small className="textSmall">{pairName} PANCAKE LP</small> to Earn PURSE</small></div>

                            <div className="" style={{ color: 'white' }}> {aprloading ?
                                <div className="borderTop" style={{ marginTop: '8px' }}>
                                    <span className=""><small>APR: {parseFloat(apr.toString()).toLocaleString('en-US', { maximumFractionDigits: 2 })} % &nbsp;</small></span>
                                    <span className="">
                                        <ReactPopup trigger={open => (
                                            <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                                        )}
                                            on="hover"
                                            position="right center"
                                            offsetY={-23}
                                            offsetX={0}
                                            contentStyle={{ padding: '5px' }}
                                        ><span className="textInfo"><small>APR is affected by the price of PURSE which is not yet stabilized. </small></span>
                                            <span className="textInfo mt-2"><small>If it shows 'NaN' or 'Infinity', it means the pool has no LP token staked currently. </small></span>
                                        </ReactPopup></span><br />
                                    <span><small>APY: {parseFloat(apyDaily.toString()).toLocaleString('en-US', { maximumFractionDigits: 0 })} % &nbsp;</small></span>
                                    <span className="">
                                        <ReactPopup trigger={open => (
                                            <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                                        )}
                                            on="hover"
                                            position="right center"
                                            offsetY={-23}
                                            offsetX={0}
                                            contentStyle={{ padding: '5px' }}
                                        ><span className="textInfo"><small>APY is calculated using APR and the compounding period. </small></span>
                                            <span className="textInfo mt-2"><small>The value shown is based on daily compounding frequency. </small></span>
                                            <span className="textInfo mt-2"><small>For weekly and monthly compounding frequency, APY is {parseFloat(apyWeekly.toString()).toFixed(0)} % and {parseFloat(apyMonthly.toString()).toFixed(0)} % respectively</small></span>
                                        </ReactPopup></span></div> :
                                <div className="">
                                    <span><small>APR:</small></span>&nbsp;&nbsp;
                                    <span className="lds-dual-ring"><div></div><div></div><div></div></span><br />
                                    <span><small>APY:</small></span>&nbsp;&nbsp;
                                    <span className="lds-dual-ring"><div></div><div></div><div></div></span>
                                </div>} </div>

                            <span className=""><small>Bonus Multiplier: {poolInfo.bonusMultiplier}x &nbsp;
                                <ReactPopup
                                    trigger={open => (
                                        <span style={{ position: "relative", top: '-0.8px' }}><BsFillQuestionCircleFill size={10} /></span>
                                    )}
                                    on="hover"
                                    position="right center"
                                    offsetY={-23}
                                    offsetX={0}
                                    contentStyle={{ padding: '5px' }}
                                >
                                    <span className="textInfo"><small>Multiplier represents X times of PURSE rewards each farm will receive.</small><br /></span>
                                    <span className="textInfo mt-2"><small>For example, a 1x farm receives 1x PURSE per block while a 40x farm receives 40x PURSE per block.</small><br /></span>
                                    <span className="textInfo mt-2"><small>This amount is already included in the farm APR calculations. </small></span></ReactPopup>&nbsp;</small></span><br />
                            <span className=" ">
                                {isUserLoading?
                                <small><Loading/></small>
                                :
                                <small>User LP Staked: {parseFloat(formatBigNumber(lpStaked?.amount,'ether')).toLocaleString('en-US', { maximumFractionDigits: 2 })}</small>
                                }
                            </span><br />
                            <span className=" "><small>Total LP Staked: {parseFloat(formatBigNumber(stakedBalance,'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })}</small></span><br />
                            <span className=" "><small>Purse Earned: {parseFloat(formatBigNumber(purseEarned,'ether')).toLocaleString('en-US', { maximumFractionDigits: 3 })}</small></span><br />
                            <span className=" "><small>{aprloading ? <div className="">TVL: $ {parseFloat(tvl.toString()).toLocaleString('en-US', { maximumFractionDigits: 0 })} </div> :
                                <div className="">
                                    <span><small>TVL:</small></span>&nbsp;&nbsp;
                                    <span className="lds-dual-ring"><div></div><div></div><div></div></span>
                                </div>} </small></span>
                            <Buttons variant="outline-info" size="sm" style={{ minWidth: '80px', marginTop: '10px' }} className="mb-2" onClick={() => {
                                setTrigger(true)
                            }}>Select</Buttons>
                            <div >
                                <Buttons
                                    variant="outline-success"
                                    type="submit"
                                    size="sm"
                                    style={{ minWidth: '80px' }}
                                    disabled={isHarvest}
                                    onClick={async(event) => {
                                        event.preventDefault()
                                        setIsHarvest(true)
                                        await harvest()
                                        setIsHarvest(false)
                                    }}>
                                    {isHarvest?<Loading/>:<div>Harvest</div>}
                                </Buttons>
                            </div>
                        </div>
                    </span>
                </div>
            </div>
        </div>
            <div className="content mr-auto ml-auto" id="content">
                <Popup trigger={trigger} setTrigger={setTrigger}>
                    <div className="container-fluid">
                        <Deposit
                            selectedPoolInfo={poolInfo}
                            selectedPoolUserInfo={userInfo}
                            bscProvider={bscProvider}
                            pairName={pairName}
                            purseTokenUpgradableBalance={purseTokenUpgradableBalance}
                            harvest={harvest}
                            signer={signer}
                            trigger={triggerWallet}
                            setTrigger={setTriggerWallet}
                            switchNetwork={switchNetwork}
                            lpTokenAddress={lpTokenAddress}
                            showToast={showToast}
                            lpStaked={lpStaked}
                            purseEarned={purseEarned}
                        />
                    </div>
                </Popup>
            </div>
        </div>
    )
}