import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom';
import purse from '../../assets/images/purse.png'
import purse2 from '../../assets/images/purse2.png'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Buttons from 'react-bootstrap/Button'
import '../App.css';
import {Popup as ReactPopup} from 'reactjs-popup';
import Popup from '../Popup'
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import { FaExclamationCircle } from 'react-icons/fa';
import PurseFarm from '../../farm/farmPurse.json'
import RestakingFarm from '../../abis/RestakingFarm.json'
import IPancakePair from '../../abis/IPancakePair.json'
import PurseTokenUpgradable from '../../abis/PurseTokenUpgradable.json'
import { BigNumber, ethers } from 'ethers'
import * as Constants from "../../constants"
import { callContract, formatBigNumber, readContract, supportedChain } from '../utils';
import { useWeb3React } from '@web3-react/core';
import Deposit from '../Deposit';
import ConnectWallet from '../ConnectWallet'

export default function FarmMenu(props: any) {
    let {
        bscProvider,
        farmNetwork,
        signer
    } = props

    const {account,isActive,chainId} = useWeb3React()
    const [totalPendingReward, setTotalPendingReward] = useState<BigNumber>(BigNumber.from("0"))
    const [tvl, setTvl] = useState<number[]>([])
    const [apr, setApr] = useState<number[]>([])
    const [apyDaily, setApyDaily] = useState<number[]>([])
    const [apyWeekly, setApyWeekly] = useState<number[]>([])
    const [apyMonthly, setApyMonthly] = useState<number[]>([])
    const [aprloading, setAprLoading] = useState(false)
    const [purseTokenUpgradableBalance, setPurseTokenUpgradableBalance] = useState<BigNumber>(BigNumber.from("0"))
    const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(BigNumber.from("0"))
    const [totalRewardPerBlock, setTotalRewardPerBlock] = useState<BigNumber>(BigNumber.from("0"))
    const [poolInfos, setPoolInfos] = useState<any>([])
    const [userInfos, setUserInfos] = useState<any>([])
    const [stakedBalance, setStakedBalance] = useState('0')
    const [pendingRewards, setPendingRewards] = useState<any>([])
    const [farmLoading, setFarmLoading] = useState<Boolean>(false)
    const [trigger, setTrigger] = useState<Boolean>(false)
    const [selectedPoolInfo, setSelectedPoolInfo] = useState<any>()
    const [selectedPoolUserInfo, setSelectedPoolUserInfo] = useState()
    const [selectedPendingReward, setSelectedPendingReward] = useState()
    const [triggerWallet, setTriggerWallet] = useState(false)

    const restakingFarm = new ethers.Contract(Constants.RESTAKING_FARM_ADDRESS, RestakingFarm.abi, bscProvider)
    const pancakeContract = new ethers.Contract(Constants.PANCAKE_PAIR_ADDRESS, IPancakePair.abi, bscProvider)
    const purseTokenUpgradable = new ethers.Contract(Constants.PURSE_TOKEN_UPGRADABLE_ADDRESS, PurseTokenUpgradable.abi, bscProvider)

    useEffect(()=>{
        async function loadData(){
            let _poolLength = await restakingFarm.poolLength()
            _poolLength = parseFloat(_poolLength.toString())

            const _stakedBalance = await pancakeContract.balanceOf(Constants.RESTAKING_FARM_ADDRESS)
            setStakedBalance(_stakedBalance)

            const _purseTokenTotalSupply = await purseTokenUpgradable._totalSupply()
            setPurseTokenTotalSupply(_purseTokenTotalSupply)

            const _purseTokenUpgradableBalance = await readContract(purseTokenUpgradable,"balanceOf",account)
            setPurseTokenUpgradableBalance(_purseTokenUpgradableBalance)

            const farm = PurseFarm.farm
            let _pendingRewards: string[] = []
            let _totalRewardPerBlock: number = 0
            let _totalPendingReward: BigNumber = BigNumber.from("0")
            let _poolInfos: any[] = []
            let _userInfos: any[] = []

            let response = await fetch(Constants.MONGO_TVLAPR_RESPONSE_API);
            const myJson = await response.json();
            let tvlArray = myJson["TVL"]
            let aprArray = myJson["APR"]
            let _tvl: number[] = []
            let _apr: number[] = []
            let _apyDaily: number[] = []
            let _apyWeekly: number[] = []
            let _apyMonthly: number[] = []

            for (let i=0; i < _poolLength; i++){

                let _poolInfo = farm[i]
                _totalRewardPerBlock += parseInt(_poolInfo.pursePerBlock) * _poolInfo.bonusMultiplier
            
                const _lpAddress = _poolInfo.lpAddresses[supportedChain(chainId).toString() as keyof typeof _poolInfo.lpAddresses]

                const _pendingReward = await readContract(restakingFarm,"pendingReward",_lpAddress, account)
                _pendingRewards.push(_pendingReward)
                _totalPendingReward.add(formatBigNumber(_pendingReward,'0'))

                _poolInfos.push(_poolInfo)

                const _userInfo = await readContract(restakingFarm,"userInfo",_lpAddress, account)
                _userInfos.push(_userInfo ? formatBigNumber(_userInfo.amount, 'ether') : 'NaN')

                _tvl.push(tvlArray)
                _apr.push(aprArray)
                _apyDaily.push((Math.pow((1 + 0.8 * aprArray / 36500), 365) - 1) * 100)
                _apyWeekly.push((Math.pow((1 + 0.8 * aprArray / 5200), 52) - 1) * 100)
                _apyMonthly.push((Math.pow((1 + 0.8 * aprArray / 1200), 12) - 1) * 100)
            }
            
            setPendingRewards(_pendingRewards)
            setTotalPendingReward(_totalPendingReward)
            setTotalRewardPerBlock(BigNumber.from(_totalRewardPerBlock.toString()))
            setPoolInfos(_poolInfos)
            setUserInfos(_userInfos)

            setTvl(_tvl)
            setApr(_apr)
            setApyDaily(_apyDaily)
            setApyWeekly(_apyWeekly)
            setApyMonthly(_apyMonthly)
            setAprLoading(true)
            setFarmLoading(true)
        }
        loadData()
    },[account,isActive,userInfos,pendingRewards])

    const selectPool = (i:number) => { 
        setSelectedPoolInfo(poolInfos[i])
        setSelectedPoolUserInfo(userInfos[i])
        setSelectedPendingReward(pendingRewards[i])
    }

    const harvest = async () => {
        if (isActive && selectedPoolInfo && chainId) {
            await callContract(signer,restakingFarm,"claimReward",selectedPoolInfo.lpAddresses[chainId])
        } else {
            setTriggerWallet(true)
        }
    }

    return (
        <div>
            
        <div id="content" className="mt-3">
            <div className="text-center">
                <ButtonGroup>
                    <Link to="/lpfarm/menu/" style={{ textDecoration: "none" }}>
                        <Buttons className="textPurpleMedium center hover" variant="outline" size="lg"> PANCAKESWAP</Buttons>
                    </Link>
                    <Link to="/lpfarm/fxswap/" style={{ textDecoration: "none" }}>
                        <Buttons className="textWhiteMedium center hover" variant="link" size="lg"> FXSWAP</Buttons>
                    </Link>
                </ButtonGroup>
            </div>
            <div className="center img">
                <img src={purse2} height='180' alt="" />
            </div>
            <h1 className="textWhite center" style={{fontSize:"40px", textAlign:"center"}}><b>LP Restaking Farm</b></h1>
            <div className="center mt-4 mb-3" style={{ fontFamily: 'Verdana', color: 'silver', textAlign:"center"}}>Stake Pancakeswap LP Tokens to earn PURSE&nbsp;!</div>
            <br />

            <div className="row center" style={{ minWidth: '300px' }}>
                <div className="card mb-4 cardbody" style={{ width: '350px', color: 'white' }} >
                    <div className="card-body">
                        <span>
                            <span className="float-left">
                                Your PURSE Balance&nbsp;
                                <ReactPopup 
                                    trigger={open => (
                                        <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={12} /></span>
                                    )}
                                    on="hover"
                                    position="right center"
                                    offsetY={-23}
                                    offsetX={5}
                                    contentStyle={{ padding: '3px' }}
                                >
                                    <span className="textInfo"><small>The amount shown is the PURSE balance on BSC for the address you are currently connected to.</small></span>
                                </ReactPopup><br />
                                <b>{parseFloat(formatBigNumber(purseTokenUpgradableBalance, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 2 })}</b>
                            </span><br /><br /><br />
                        </span>
                        <span>
                            <small>
                                <span className="float-left">Total Pending Harvest</span>
                                <span className="float-right">
                                    <span>
                                        {parseFloat(formatBigNumber(totalPendingReward, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })}&nbsp;PURSE
                                    </span>
                                </span>
                            </small>
                        </span>
                    </div>
                </div><li style={{color:'transparent'}}/>

                <div className="card mb-4 cardbody" style={{ width: '350px', color: 'white' }}>
                    <div className="card-body">
                        <span>
                            <span className="float-left">
                                Total PURSE Supply&nbsp;
                                <ReactPopup 
                                    trigger={open => (
                                        <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={12} /></span>
                                    )}
                                    on="hover"
                                    position="right center"
                                    offsetY={-23}
                                    offsetX={5}
                                    contentStyle={{ padding: '3px' }}
                                >
                                    <span className="textInfo"><small>The amount shown is the Total PURSE Supply on BSC network.</small></span>
                                </ReactPopup><br />
                                <b>{parseFloat(formatBigNumber(purseTokenTotalSupply, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })}</b>
                            </span><br /><br /><br />
                            <span>
                                <small>
                                    <span className="float-left">Total Reward / Block</span>
                                    <span className="float-right">
                                        <span>
                                            {parseFloat(formatBigNumber(totalRewardPerBlock, 'ether')).toLocaleString('fullwide', { useGrouping: false })}&nbsp;PURSE
                                        </span>
                                    </span>
                                </small>
                            </span>
                        </span>
                    </div>
                </div><li style={{color:'transparent'}}/>
            </div>

            <br />
            <div className="center mb-2" style={{ color: 'white' }}><b><big>Select Your Favourite pool entrees&nbsp;!</big></b></div>
            <div className="center" style={{ color: 'silver' }}><small><FaExclamationCircle size={13} style={{marginBottom:"3px"}}/>&nbsp;&nbsp;Attention&nbsp;: Be sure to familiar with protocol risks and fees before using the farms&nbsp;!</small></div>
            <br />



            {farmLoading ?
                <div className="row floated" >
                    {poolInfos.map((poolSegmentInfo:any, key:string) => {
                        let i = poolInfos.indexOf(poolSegmentInfo)
                        return (
                            <div key={key}>
                                <div className="col">
                                    <div className="card mb-4 cardbody card-body text-center" style={{ maxWidth: '230px', color: 'white' }}>
                                        <span>
                                            <img src={purse} height='30' alt="" /><br />
                                            <b className="text">{poolInfos[i].token[farmNetwork]["symbol"]}-{poolInfos[i].quoteToken[farmNetwork]["symbol"]}</b>
                                            <div>
                                                <div className=""><small>Deposit<small className="textSmall">{poolInfos[i].token[farmNetwork]["symbol"]}-{poolInfos[i].quoteToken[farmNetwork]["symbol"]} PANCAKE LP</small> to Earn PURSE</small></div>

                                                <div className="" style={{ color: 'white' }}> {aprloading ?
                                                    <div className="borderTop" style={{ marginTop: '8px' }}>
                                                        <span className=""><small>APR: {parseFloat(apr[i].toString()).toLocaleString('en-US', { maximumFractionDigits: 2 })} % &nbsp;</small></span>
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
                                                        <span><small>APY: {parseFloat(apyDaily[i].toString()).toLocaleString('en-US', { maximumFractionDigits: 0 })} % &nbsp;</small></span>
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
                                                                <span className="textInfo mt-2"><small>For weekly and monthly compounding frequency, APY is {parseFloat(apyWeekly[i].toString()).toFixed(0)} % and {parseFloat(apyMonthly[i].toString()).toFixed(0)} % respectively</small></span>
                                                            </ReactPopup></span></div> :
                                                    <div className="">
                                                        <span><small>APR:</small></span>&nbsp;&nbsp;
                                                        <span className="lds-dual-ring"><div></div><div></div><div></div></span><br />
                                                        <span><small>APY:</small></span>&nbsp;&nbsp;
                                                        <span className="lds-dual-ring"><div></div><div></div><div></div></span>
                                                    </div>} </div>

                                                <span className=""><small>Bonus Multiplier: {poolInfos[i].bonusMultiplier}x &nbsp;
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
                                                <span className=" "><small>User LP Staked: {parseFloat(userInfos[i]).toLocaleString('en-US', { maximumFractionDigits: 2 })}</small></span><br />
                                                <span className=" "><small>Total LP Staked: {parseFloat(formatBigNumber(stakedBalance,'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })}</small></span><br />
                                                <span className=" "><small>Purse Earned: {parseFloat(pendingRewards[i]).toLocaleString('en-US', { maximumFractionDigits: 0 })}</small></span><br />
                                                <span className=" "><small>{aprloading ? <div className="">TVL: $ {parseFloat(tvl[i].toString()).toLocaleString('en-US', { maximumFractionDigits: 0 })} </div> :
                                                    <div className="">
                                                        <span><small>TVL:</small></span>&nbsp;&nbsp;
                                                        <span className="lds-dual-ring"><div></div><div></div><div></div></span>
                                                    </div>} </small></span>
                                                <Buttons variant="outline-info" size="sm" style={{ minWidth: '80px', marginTop: '10px' }} className="mb-2" onClick={() => {
                                                    selectPool(i)
                                                    setTrigger(true)
                                                }}>Select</Buttons>
                                                <div >
                                                    <Buttons
                                                        variant="outline-success"
                                                        type="submit"
                                                        size="sm"
                                                        style={{ minWidth: '80px' }}
                                                        onClick={async(event) => {
                                                            event.preventDefault()
                                                            selectPool(i)
                                                            await harvest()
                                                        }}>
                                                        Harvest
                                                    </Buttons>
                                                </div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                :
                <div className="center">
                    <div className="bounceball"></div> &nbsp;
                    <div className="textLoadingSmall">NETWORK IS Loading...</div>
                </div>
            }
            <ConnectWallet trigger={triggerWallet} setTrigger={setTriggerWallet}/>
        </div >
        <div className="content mr-auto ml-auto" id="content">
            <Popup trigger={trigger} setTrigger={setTrigger}>
                <div className="container-fluid">
                    <Deposit
                    selectedPoolInfo={selectedPoolInfo}
                    selectedPoolUserInfo={selectedPoolUserInfo}
                    bscProvider={bscProvider}
                    farmNetwork={farmNetwork}
                    selectedPendingReward={selectedPendingReward}
                    purseTokenUpgradableBalance={purseTokenUpgradableBalance}
                    harvest={harvest}
                    signer={signer}
                    trigger={triggerWallet}
                    setTrigger={setTriggerWallet}
                    />
                </div>
            </Popup>
            </div>
        </div>
    );
}

