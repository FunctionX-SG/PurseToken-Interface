import React from 'react'
import MediaQuery from 'react-responsive';
import { IoStar } from 'react-icons/io5'
import { formatUnits } from 'ethers/lib/utils'


export default function FarmInfo(props: any) {
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
                  <tr>
                    <td>{props.poolLength}</td>
                    <td>{parseFloat(formatUnits(props.purseTokenTotalSupply, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                    <td>{formatUnits(props.totalrewardperblock, 'ether')} Purse per block</td>
                  </tr>
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
                  <tr>
                    <td>{parseFloat(formatUnits(props.poolCapRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                    <td>{parseFloat(formatUnits(props.poolMintedRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                    <td>{parseFloat(formatUnits(props.poolRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                  </tr>
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
                    <td>{props.poolLength}</td>
                    <td>{formatUnits(props.totalrewardperblock, 'ether')} Purse per block</td>
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
                    <td>{parseFloat(formatUnits(props.purseTokenTotalSupply, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                    <td>{parseFloat(formatUnits(props.poolCapRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
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
                    <td>{parseFloat(formatUnits(props.poolMintedRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
                    <td>{parseFloat(formatUnits(props.poolRewardToken, 'ether')).toLocaleString('en-US', {maximumFractionDigits:0})} Purse</td>
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
