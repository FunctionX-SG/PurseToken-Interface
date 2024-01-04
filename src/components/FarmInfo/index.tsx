import React, { useState, useEffect } from 'react'
import MediaQuery from 'react-responsive';
import { IoStar } from 'react-icons/io5'
import PurseFarm from '../../farm/farmPurse.json'
import { BigNumber } from 'ethers'
import * as Constants from "../../constants"
import { formatBigNumber } from '../utils';
import { useWeb3React } from '@web3-react/core';
import { Loading } from '../Loading';
import { useContract } from '../state/contract/hooks';

export default function FarmInfo() {
  const {account} = useWeb3React()

  const {restakingFarm,purseTokenUpgradable} = useContract()

  const [totalRewardPerBlock, setTotalRewardPerBlock] = useState<BigNumber>(BigNumber.from("0"))
  const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(BigNumber.from("0"))
  const [poolLength, setPoolLength] = useState<number>(0)
  const [poolCapRewardToken, setPoolCapRewardToken] = useState('0')
  const [poolMintedRewardToken, setPoolMintedRewardToken] = useState('0')
  const [poolRewardToken, setPoolRewardToken] = useState('0')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(()=>{
    async function loadData(){
      let _poolLength = await restakingFarm.poolLength()
      _poolLength = parseFloat(_poolLength.toString())
      setPoolLength(_poolLength)

      const _purseTokenTotalSupply = await purseTokenUpgradable.totalSupply()
      setPurseTokenTotalSupply(_purseTokenTotalSupply)

      const _poolCapRewardToken = await restakingFarm.capMintToken()
      setPoolCapRewardToken(_poolCapRewardToken)

      const _poolMintedRewardToken = await restakingFarm.totalMintToken()
      setPoolMintedRewardToken(_poolMintedRewardToken)

      const _poolRewardToken = await purseTokenUpgradable.balanceOf(Constants.RESTAKING_FARM_ADDRESS)
      setPoolRewardToken(_poolRewardToken)

      let _totalRewardPerBlock: BigNumber = BigNumber.from("0")

      for (let i=0; i < _poolLength; i++){
        const _poolAddress = await restakingFarm.poolTokenList(i)
        const _poolInfo = await restakingFarm.poolInfo(_poolAddress.toString())
        _totalRewardPerBlock = _totalRewardPerBlock.add(_poolInfo.pursePerBlock?.mul(_poolInfo.bonusMultiplier))
      }
      setTotalRewardPerBlock(_totalRewardPerBlock)
      setIsLoading(false)

    }
    loadData()
  },[account,purseTokenUpgradable,restakingFarm])


  return (
      <div id="content" className="mt-4">
        <label className="textWhite center mb-5" style={{ fontSize : '34px', textAlign: 'center'}}><big><b>BSC Farm Dashboard</b></big></label>
        <MediaQuery minWidth={601}>
        <div className="card mb-2 cardbody" >
          <div className="card-body center">
            <table className="textWhiteSmall text-center">
              <thead>
                <tr>
                  <th scope="col">Total Pool</th>
                  <th scope="col">PURSE Token Total Supply</th>
                  <th scope="col">Farm's PURSE Reward</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ?
                <tr>
                  <td><Loading/></td>
                  <td><Loading/></td>
                  <td><Loading/></td>
                </tr>
                :
                <tr>
                  <td>{poolLength.toString()}</td>
                  <td>{parseFloat(formatBigNumber(purseTokenTotalSupply, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                  <td>{parseFloat(formatBigNumber(totalRewardPerBlock, 'ether')).toLocaleString('en-US', {maximumFractionDigits:3})} Purse per block</td>
                </tr>
                }
              </tbody>
              <thead><tr><td></td></tr></thead>
              <thead>
                <tr>
                  <th scope="col">Farm's Cap Reward Token</th>
                  <th scope="col">Farm's Minted Reward Token</th>
                  <th scope="col">Farm's PURSE Balance</th>
                </tr>
              </thead>
              <tbody>
              {isLoading ?
                <tr>
                  <td><Loading/></td>
                  <td><Loading/></td>
                  <td><Loading/></td>
                </tr>
                :
                <tr>
                  <td>{parseFloat(formatBigNumber(poolCapRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                  <td>{parseFloat(formatBigNumber(poolMintedRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                  <td>{parseFloat(formatBigNumber(poolRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                </tr>
              }
              </tbody>
            </table>
          
          </div></div>
        </MediaQuery>
        <MediaQuery maxWidth={600}>
        <div className="card mb-2 cardbody" style={{minWidth:"300px"}}>
          <div className="card-body center">
            <table className="textWhiteSmaller text-center">
              <thead>
                <tr>
                  <th scope="col">Total Pool</th>
                  <th scope="col">Farm's PURSE Reward</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{poolLength}</td>
                  <td>{parseFloat(formatBigNumber(totalRewardPerBlock, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse per block</td>
                </tr>
              </tbody>
              <thead><tr><td></td></tr></thead>
              <thead>
                <tr>
                  <th scope="col">PURSE Token Total Supply</th>
                  <th scope="col">Farm's Cap Reward Token</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{parseFloat(formatBigNumber(purseTokenTotalSupply, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                  <td>{parseFloat(formatBigNumber(poolCapRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                </tr>
              </tbody>
              <thead><tr><td></td></tr></thead>
              <thead>
                <tr>
                  <th scope="col">Farm's Minted Reward Token</th>
                  <th scope="col">Farm's PURSE Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{parseFloat(formatBigNumber(poolMintedRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                  <td>{parseFloat(formatBigNumber(poolRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                </tr>
              </tbody>
            </table>
          
          </div></div>
          </MediaQuery>
          <br/> <br/>

        <div className="text mt-5" style={{ color: 'silver', fontSize: "14px" }}>&nbsp;Remarks :</div><br/>
        <div className="rowC ml-2 mt-2" style={{ color: 'silver', fontSize: "12px" }}>&nbsp;<div><IoStar className='mb-1'/>&nbsp;&nbsp;</div><div>Farm Cap Reward Token: Total capacity reward tokens will be minted by this farm.</div></div>
        <div className="rowC ml-2 mt-1" style={{ color: 'silver', fontSize: "12px" }}>&nbsp;<div><IoStar className='mb-1'/>&nbsp;&nbsp;</div><div>Farm Minted Reward Token: Total reward tokens minted by this farm until now.</div></div>
        <div className="rowC ml-2 mt-1" style={{ color: 'silver', fontSize: "12px" }}>&nbsp;<div><IoStar className='mb-1'/>&nbsp;&nbsp;</div><div>Farm's Reward Token: Total reward tokens inside this farm (smart contract).</div></div>
      </div>


    );
}
