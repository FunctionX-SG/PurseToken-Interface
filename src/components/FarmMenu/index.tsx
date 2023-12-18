import React, {useEffect, useState, useCallback} from 'react'
import { Link } from 'react-router-dom';
import purse2 from '../../assets/images/purse2.png'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Buttons from 'react-bootstrap/Button'
import '../App.css';
import {Popup as ReactPopup} from 'reactjs-popup';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import { FaExclamationCircle } from 'react-icons/fa';
import PurseFarm from '../../farm/farmPurse.json'
import { BigNumber, ethers } from 'ethers'
import * as Constants from "../../constants"
import { formatBigNumber, readContract, supportedChain, fetcher } from '../utils';
import { useWeb3React } from '@web3-react/core';
import { Loading } from '../Loading';
import PoolCard from '../PoolCard'
import useSWR from 'swr'
import { useContract } from '../state/contract/hooks';
import IPancakePair from '../../abis/IPancakePair.json'
import { useProvider } from '../state/provider/hooks';

export default function FarmMenu() {
    const farmNetwork = "MAINNET"
    const {account,isActive,chainId} = useWeb3React()
    const {bscProvider} = useProvider()

    const {restakingFarm,purseTokenUpgradable} = useContract()

    const [totalPendingReward, setTotalPendingReward] = useState<BigNumber>(BigNumber.from("0"))
    const [tvl, setTvl] = useState<number[]>([])
    const [apr, setApr] = useState<number[]>([])
    const [apyDaily, setApyDaily] = useState<number[]>([])
    const [apyWeekly, setApyWeekly] = useState<number[]>([])
    const [apyMonthly, setApyMonthly] = useState<number[]>([])
    const [aprloading, setAprLoading] = useState(false)
    const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(BigNumber.from("0"))
    const [totalRewardPerBlock, setTotalRewardPerBlock] = useState<BigNumber>(BigNumber.from("0"))
    const [poolInfos, setPoolInfos] = useState<any>([])
    const [userInfos, setUserInfos] = useState<any>([])
    const [stakeBalances, setStakeBalances] = useState<any>([])
    const [farmLoading, setFarmLoading] = useState<Boolean>(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isUserLoading,setIsUserLoading] = useState(true)

    const {data:purseTokenUpgradableBalance} = useSWR({
        contract:"purseTokenUpgradable",
        method:"balanceOf",
        params:[account]
    },{
        fetcher: fetcher(purseTokenUpgradable),
        refreshInterval:5000
    })

    const loadData = useCallback(async() => {
        let _poolLength = await restakingFarm.poolLength()
        _poolLength = parseFloat(_poolLength.toString())

        const _purseTokenTotalSupply = await purseTokenUpgradable._totalSupply()
        setPurseTokenTotalSupply(_purseTokenTotalSupply)

        setIsLoading(false)

        const farm = PurseFarm.farm
        let _pendingRewards: string[] = []
        let _totalRewardPerBlock: BigNumber = BigNumber.from("0")
        let _totalPendingReward: BigNumber = BigNumber.from("0")
        let _poolInfos: any[] = farm
        let _userInfos: any[] = []

        let response = await fetch(Constants.MONGO_RESPONSE_0_API);
        const myJson = await response.json();
        let tvlArray = myJson["TVL"]?.["TVL"]
        let aprArray = myJson["APR"]?.["APR"]
        let _tvl: number[] = []
        let _apr: number[] = []
        let _apyDaily: number[] = []
        let _apyWeekly: number[] = []
        let _apyMonthly: number[] = []
        let _stakeBalances: BigNumber[] = []

        for (let i=0; i < _poolLength; i++){

            const _lpAddress = await readContract(restakingFarm,"poolTokenList",i)
            const _poolInfo = await readContract(restakingFarm,"poolInfo",_lpAddress.toString())
            _totalRewardPerBlock = _totalRewardPerBlock.add(_poolInfo.pursePerBlock?.mul(_poolInfo.bonusMultiplier))
                    
            const lpContract = new ethers.Contract(_lpAddress, IPancakePair.abi, bscProvider)

            const stakedBalance = await readContract(lpContract,"balanceOf",Constants.RESTAKING_FARM_ADDRESS)

            const _pendingReward = await readContract(restakingFarm,"pendingReward",_lpAddress, account)
            _pendingRewards.push(_pendingReward)
            _totalPendingReward = _totalPendingReward.add(_pendingReward?_pendingReward:0)

            const _userInfo = await readContract(restakingFarm,"userInfo",_lpAddress, account)
            _userInfos.push(_userInfo ? _userInfo.amount : 'NaN')

            _tvl.push(tvlArray?.[i].tvl||0)
            _apr.push(aprArray?.[i].apr||0)
            _stakeBalances.push(stakedBalance)
            _apyDaily.push((Math.pow((1 + 0.8 * aprArray?.[i].apr / 36500), 365) - 1) * 100)
            _apyWeekly.push((Math.pow((1 + 0.8 * aprArray?.[i].apr / 5200), 52) - 1) * 100)
            _apyMonthly.push((Math.pow((1 + 0.8 * aprArray?.[i].apr / 1200), 12) - 1) * 100)
        }
        setTotalPendingReward(_totalPendingReward)
        setTotalRewardPerBlock(_totalRewardPerBlock)
        setPoolInfos(_poolInfos)
        setUserInfos(_userInfos)
        setStakeBalances(_stakeBalances)

        setTvl(_tvl)
        setApr(_apr)
        setApyDaily(_apyDaily)
        setApyWeekly(_apyWeekly)
        setApyMonthly(_apyMonthly)
        setAprLoading(true)
        setFarmLoading(true)
        setIsUserLoading(false)
    },[account,chainId,purseTokenUpgradable,restakingFarm])

    useEffect(()=>{
        loadData()
    },[account,isActive,chainId,purseTokenUpgradable,restakingFarm,loadData])

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
                                {isLoading ?
                                <Loading/>
                                :
                                <b>{parseFloat(formatBigNumber(purseTokenUpgradableBalance, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 2 })}</b>
                                }
                                </span><br /><br /><br />
                        </span>
                        <span>
                            <small>
                                <span className="float-left">Total Pending Harvest</span>
                                <span className="float-right">
                                    {isLoading ?
                                    <span><Loading/></span>
                                    :
                                    <span>
                                        {parseFloat(formatBigNumber(totalPendingReward, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 3 })}&nbsp;PURSE
                                    </span>
                                    }
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
                                {isLoading ?
                                <Loading/>
                                :
                                <b>{parseFloat(formatBigNumber(purseTokenTotalSupply, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })}</b>
                                }
                                </span><br /><br /><br />
                            <span>
                                <small>
                                    <span className="float-left">Total Reward / Block</span>
                                    <span className="float-right">
                                        {isLoading ?
                                        <span><Loading/></span>
                                        :
                                        <span>
                                            {parseFloat(formatBigNumber(totalRewardPerBlock, 'ether')).toLocaleString('fullwide', { useGrouping: false })}&nbsp;PURSE
                                        </span>
                                        }
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
                    
                    {poolInfos.map((poolInfo:any, key:number) => 
                        <PoolCard
                            key={`${poolInfos[key].token[farmNetwork]["symbol"]}-${poolInfos[key].quoteToken[farmNetwork]["symbol"]}`}
                            pairName={`${poolInfos[key].token[farmNetwork]["symbol"]}-${poolInfos[key].quoteToken[farmNetwork]["symbol"]}`}
                            stakeBalance={stakeBalances[key]}
                            aprloading={aprloading}
                            apr={apr[key]}
                            apyDaily={apyDaily[key]}
                            apyWeekly={apyWeekly[key]}
                            apyMonthly={apyMonthly[key]}
                            poolInfo={poolInfos[key]}
                            userInfo={userInfos[key]}
                            isUserLoading={isUserLoading}
                            tvl={tvl[key]}
                        />
                    )}
                </div>
                :
                <div className="center">
                    <div className="bounceball"></div> &nbsp;
                    <div className="textLoadingSmall">NETWORK IS Loading...</div>
                </div>
            }
        </div >
        </div>
    );
}

