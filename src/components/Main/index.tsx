import React, { useState, useEffect } from 'react'
import Popup from 'reactjs-popup';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import MediaQuery from 'react-responsive';
import { AreaChart, Area, YAxis, XAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import * as Constants from "../../constants"
import { useWeb3React } from '@web3-react/core';
import { Loading } from '../Loading';
import { usePursePrice } from '../state/PursePrice/hooks';
import { useContract } from '../state/contract/hooks';

export default function Main(props: any) {

  const {isActive,account} = useWeb3React()
  const [PURSEPrice] = usePursePrice()

  const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(BigNumber.from("0"))
  const [totalBurnAmount, setTotalBurnAmount] = useState('0')
  const [sum30BurnAmount, setSum30BurnAmount] = useState('0')
  const [totalTransferAmount, setTotalTransferAmount] = useState('0')
  const [sum30TransferAmount, setSum30TransferAmount] = useState('0')
  const [cumulateTransfer, setCumulateTransfer] = useState<{Sum: number; Date: string}[]>([])
  const [cumulateBurn, setCumulateBurn] = useState<{Sum: number; Date: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const {purseTokenUpgradable} = useContract()

  useEffect(()=>{
    async function loadData(){
      const _purseTokenTotalSupply = await purseTokenUpgradable._totalSupply()
      setPurseTokenTotalSupply(_purseTokenTotalSupply)

      const mongoResponse0 = await fetch(Constants.MONGO_RESPONSE_0_API);
      const myJson0: any = await mongoResponse0.json()

      const _totalTransferAmount = myJson0["TransferTotal"][0]
      setTotalTransferAmount(_totalTransferAmount)

      const _sum30TransferAmount = myJson0["Transfer30Days"][0]
      setSum30TransferAmount(_sum30TransferAmount)

      const _totalBurnAmount = myJson0["BurnTotal"][0]
      setTotalBurnAmount(_totalBurnAmount)

      const _sum30BurnAmount = myJson0["Burn30Days"][0]
      setSum30BurnAmount(_sum30BurnAmount)

      let _cumulateTransfer: {Sum: number; Date: string}[] = []
      let _cumulateBurn: {Sum: number; Date: string}[] = []
      const cumulateTransferResponse = await fetch(Constants.MONGO_RESPONSE_1_API);
      const cumulateTransferJson: any = await cumulateTransferResponse.json()
      const cumulateBurnResponse = await fetch(Constants.MONGO_RESPONSE_2_API);
      const cumulateBurnJson: any = await cumulateBurnResponse.json()
      cumulateTransferJson.forEach((item:{Sum: string; Date: string}) => _cumulateTransfer.push({"Sum": parseFloat(item.Sum), "Date": item.Date}));
      cumulateBurnJson.forEach((item:{Sum: string; Date: string}) => _cumulateBurn.push({"Sum": parseFloat(item.Sum), "Date": item.Date}));
      
      setCumulateTransfer(_cumulateTransfer)
      setCumulateBurn(_cumulateBurn)
      setIsLoading(false)
    }
    loadData()
  },[isActive,account,purseTokenUpgradable])

  

  const DataFormater = (number: number) => {
    if(number > 1000000000){
      return (number/1000000000).toString() + 'B';
    }else if(number > 1000000){
      return (number/1000000).toString() + 'M';
    }else if(number > 1000){
      return (number/1000).toString() + 'K';
    }else{
      return number.toString();
    }
  }
  const NumberFormater = (number:string) => {
    return parseFloat(number).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return (
    <div id="content" className="mt-4">
      <label className="textWhite center mb-5" style={{fontSize:"40px",textAlign:"center"}}><big><b>PURSE Dashboard</b></big></label>
      <MediaQuery minWidth={601}>
      <div className="card mb-4 cardbody">
        <div className="card-body center">
          <table className="textWhiteSmall">
            <thead>
              <tr>
                <th scope="col">Market Cap</th>
                <th scope="col">Circulating Supply <span className="">
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="bottom center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '3px' }}
                  ><span className="textInfo"> Currently based on the total supply of PURSE token </span>
                  </Popup></span></th>
                <th scope="col">PURSE Token Price</th>
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
                <td>${(parseFloat(formatUnits(purseTokenTotalSupply, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(purseTokenTotalSupply, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>${parseFloat(PURSEPrice.toString()).toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
              </tr>
              }
              
            </tbody>
            <thead><tr><td></td></tr></thead>
            <thead>
              <tr>
                <th scope="col">Burn <span className="">
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="right center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '1px' }}
                  ><span className="textInfo"> (Unit in Token / Unit in USD)</span>
                  </Popup></span></th>

                <th scope="col">Distribution <span className="">
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="bottom center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '1px' }}
                  ><span className="textInfo"> (Unit in Token / Unit in USD)</span>
                  </Popup></span></th>

                <th scope="col">Liquidity <span className="">
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="left center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '1px' }}
                  ><span className="textInfo"> (Unit in Token / Unit in USD) </span>
                  </Popup></span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="col">(Total)</th>
                <th scope="col">(Total)</th>
                <th scope="col">(Total)</th>
              </tr>
            </tbody>
            <tbody>
              {isLoading ?
              <tr>
                <td><Loading/></td>
                <td><Loading/></td>
                <td><Loading/></td>
              </tr>
              :
              <tr>
                <td>{parseFloat(formatUnits(totalBurnAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(totalBurnAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(totalTransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(totalTransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(totalTransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(totalTransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
              }
            </tbody>
            <thead>
              <tr>
                <th scope="col">(Past 30 days Sum)</th>
                <th scope="col">(Past 30 days Sum)</th>
                <th scope="col">(Past 30 days Sum)</th>
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
                <td>{parseFloat(formatUnits(sum30BurnAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(sum30BurnAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(sum30TransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(sum30TransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(sum30TransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(sum30TransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div><br/><br/>
      <div className="container" style={{ width: 'fit-content' }}>
        <div className="row center" style={{borderRadius:"15px",padding:"20px 15px", backgroundColor: "rgba(106, 90, 205, 0.2)" }}>
          <div>
            <AreaChart width={460} height={300} data={cumulateBurn}>
              <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <CartesianGrid vertical={false} strokeDasharray="2 2" />
              <Tooltip formatter={NumberFormater} />
              <Legend verticalAlign="top" height={40} formatter={() => ("Burn")} wrapperStyle={{fontSize: "20px"}}/>
              <Area type="monotone" dataKey="Sum" stroke="#8884d8" fillOpacity={0.5} fill="#8884d8" />
            </AreaChart><li style={{color:'transparent'}}/>
          </div>
          <div>  
            <AreaChart width={460} height={300} data={cumulateTransfer}>
              <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <CartesianGrid vertical={false} strokeDasharray="2 2" />
              <Tooltip formatter={NumberFormater} />
              <Legend verticalAlign="top" height={40} formatter={() => ("Distribution / Liquidity")} wrapperStyle={{fontSize: "20px"}}/>
              <Area type="monotone" dataKey="Sum" stroke="#82ca9d" fillOpacity={0.5} fill="#82ca9d" />
            </AreaChart><li style={{color:'transparent'}}/>
          </div>
        </div>
      </div>
      </MediaQuery>
      <MediaQuery maxWidth={600}>
      <div className="card mb-4 cardbody" style={{minWidth:"300px"}}>
        <div className="card-body center">
          <table className="textWhiteSmaller">
            <thead>
              <tr>
                <th scope="col">Market Cap</th>
                <th scope="col">Circulating Supply <span className="">
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="left center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '3px' }}
                  ><span className="textInfo"> Currently based on the total supply of purse token </span>
                  </Popup></span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${(parseFloat(formatUnits(purseTokenTotalSupply, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(purseTokenTotalSupply, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            </tbody>
            <thead><tr><td></td></tr></thead>
            <thead>
              <tr>
                <th scope="col">Burn (Total)<span className="">&nbsp;
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="bottom center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '1px' }}
                  ><span className="textInfo"> (Unit in Token / unit in USD)</span>
                  </Popup></span></th>
                  <th scope="col">(Past 30 days&nbsp;Sum)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{parseFloat(formatUnits(totalBurnAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(totalBurnAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(sum30BurnAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(sum30BurnAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            </tbody>
            <thead><tr><td></td></tr></thead>
            <thead>
              <tr>
                <th scope="col">Distribution (Total)<span className="">&nbsp;
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="bottom center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '1px' }}
                  ><span className="textInfo"> (Unit in Token / unit in USD)</span>
                  </Popup></span></th>
                  <th scope="col">(Past 30 days&nbsp;Sum)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{parseFloat(formatUnits(totalTransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(totalTransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(sum30TransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(sum30TransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            </tbody>
            <thead><tr><td></td></tr></thead>
            <thead>
              <tr>
                <th scope="col">Liquidity (Total)<span className="">&nbsp;
                  <Popup trigger={open => (
                    <span style={{ position: "relative", top: '-1px' }}><BsFillQuestionCircleFill size={10} /></span>
                  )}
                    on="hover"
                    position="bottom center"
                    offsetY={-23}
                    offsetX={0}
                    contentStyle={{ padding: '1px' }}
                  ><span className="textInfo"> (Unit in Token / unit in USD) </span>
                  </Popup></span></th>
                  <th scope="col">(Past 30 days&nbsp;Sum)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{parseFloat(formatUnits(totalTransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(totalTransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td>{parseFloat(formatUnits(sum30TransferAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 0 })} / $ {(parseFloat(formatUnits(sum30TransferAmount, 'ether')) * PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            </tbody>
            <thead><tr><td></td></tr></thead>
            <thead>
              <tr>
                <th scope="col">PURSE Token Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${parseFloat(PURSEPrice.toString()).toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div><br/><br/>
      <div className="container" style={{ width: 'fit-content' }}>
        <div className="row center" style={{borderRadius:"15px",padding:"15px 15px 0px 0px", backgroundColor: "rgba(106, 90, 205, 0.2)" }}>
          <div>
            <AreaChart width={290} height={250} data={cumulateBurn}>
              <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <CartesianGrid vertical={false} strokeDasharray="2 2" />
              <Tooltip formatter={NumberFormater} />
              <Legend verticalAlign="top" height={50} formatter={() => ("Burn")} wrapperStyle={{fontSize: "20px"}}/>
              <Area type="monotone" dataKey="Sum" stroke="#8884d8" fillOpacity={0.5} fill="#8884d8" />
            </AreaChart><li style={{color:'transparent'}}/>
          </div>
          <div>  
            <AreaChart width={290} height={250} data={cumulateTransfer}>
              <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <CartesianGrid vertical={false} strokeDasharray="2 2" />
              <Tooltip formatter={NumberFormater} />
              <Legend verticalAlign="top" height={50} formatter={() => ("Distribution / Liquidity")} wrapperStyle={{fontSize: "20px"}}/>
              <Area type="monotone" dataKey="Sum" stroke="#82ca9d" fillOpacity={0.5} fill="#82ca9d" />
            </AreaChart><li style={{color:'transparent'}}/>
          </div>
        </div>
      </div>
      </MediaQuery>
    </div>

  );
}

