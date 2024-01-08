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
import { DataFormater, NumberFormater } from '../utils';
interface CustomTooltipProps {
  payload?: any[]
  label?: string
}

export default function Main() {

  const {isActive,account} = useWeb3React()
  const [PURSEPrice] = usePursePrice()

  const {purseTokenUpgradable} = useContract()

  const [purseTokenTotalSupply, setPurseTokenTotalSupply] = useState<BigNumber>(BigNumber.from("0"))
  const [totalBurnAmount, setTotalBurnAmount] = useState('0')
  const [sum30BurnAmount, setSum30BurnAmount] = useState('0')
  const [totalTransferAmount, setTotalTransferAmount] = useState('0')
  const [sum30TransferAmount, setSum30TransferAmount] = useState('0')
  const [cumulateTransfer, setCumulateTransfer] = useState<{Sum: number; Date: string}[]>([])
  const [cumulateBurn, setCumulateBurn] = useState<{Sum: number; Date: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)


  const CustomTick = (propsCustomTick: any) => {
    const { x, y, payload } = propsCustomTick
    const date = new Date(payload.value)
    const year = date.getFullYear()
    const month = date.toLocaleString("en-US", { month: "short" })

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={25} textAnchor="middle" fontSize={16}>
          {month}
        </text>
        <text x={0} y={46} textAnchor="middle" fontSize={12}>
          {year}
        </text>
      </g>
    )
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload, label }) => {
    if (payload && payload.length) {
      const value = parseFloat(payload[0].value)
      const date = new Date(label as any)
      const year = date.getFullYear()
      const month = date.toLocaleString("en-US", { month: "long" })
      const day = date.getDate()
      const formattedValue = value.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })

      return (
        <div className="custom-tooltip">
          <p
            className="textWhiteSmall"
            style={{
              padding: "0",
              margin: "0",
              textAlign: "center",
              width: "40px",
              height: "18px",
              color: "#fff",
              lineHeight: "18px",
              backgroundColor: "var(--basic-black)",
            }}
          >
            SUM
          </p>
          <div className="textWhiteHeading" style={{
              color: "#000",
              padding: "0",
              margin: "0",
            }}>{formattedValue}</div>
          <p className="textWhiteSmall" style={{
              color: "#000",
              padding: "0",
              margin: "0",
            }}>
            {day}-{month}-{year}
          </p>
        </div>
      )
    }

    return null
  }

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

  return (
    <div id="content" className="mt-4">
      <label className="textWhite center mb-5" style={{fontSize:"40px",textAlign:"center"}}><big><b>PURSE Dashboard</b></big></label>
      <MediaQuery minWidth={601}>
      <div className="card mb-4 cardbody">
        <div className="card-body center">
          <table className="textWhiteSmall" style={{width:"100%"}}>
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
        <div className="row center" style={{ gap: '20px' }}>
          <div>
            {/* <AreaChart width={460} height={300} data={cumulateBurn}>
              <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <CartesianGrid vertical={false} strokeDasharray="2 2" />
              <Tooltip formatter={NumberFormater} />
              <Legend verticalAlign="top" height={40} formatter={() => ("Burn")} wrapperStyle={{fontSize: "20px"}}/>
              <Area type="monotone" dataKey="Sum" stroke="#8884d8" fillOpacity={0.5} fill="#8884d8" />
            </AreaChart><li style={{color:'transparent'}}/> */}
            <div className={`common-title`} style={{ marginBottom: '40px', textAlign: "center", }}>Burn</div>
            <AreaChart
                  width={460} 
                  height={300}
                  data={cumulateBurn}
                  margin={{
                    bottom: 44,
                    left: 0,
                    top: 20,
                  }}
                >
                  <defs>
                    <linearGradient id="Burn" x1="0" y1="0" x2="1" y2="1">
                      <stop
                        offset="10%"
                        stopColor="#fcdb5b"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="50%"
                        stopColor="#f7e01e"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="100%"
                        stopColor="#ffe95b"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    axisLine={false}
                    dataKey="Date"
                    tick={CustomTick}
                    stroke="#000"
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickFormatter={DataFormater}
                    tick={{ fontSize: 16 }}
                    stroke="#000"
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="0 0"
                    stroke="#f5f5f5"
                  />
                  <Area
                    strokeWidth={3}
                    type="monotone"
                    dataKey="Sum"
                    stroke="#f7d509"
                    fill="url(#Burn)"
                    activeDot={{
                      r: 8,
                      strokeWidth: 3,
                      stroke: "#ffffff",
                      fill: "#000000",
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#000",
                      strokeWidth: 1,
                      strokeDasharray: "2 2",
                    }}
                    itemStyle={{ color: "#8884d8" }}
                    formatter={NumberFormater}
                  />
                </AreaChart>
          </div>
          <div>  
            {/* <AreaChart width={460} height={300} data={cumulateTransfer}>
              <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <CartesianGrid vertical={false} strokeDasharray="2 2" />
              <Tooltip formatter={NumberFormater} />
              <Legend verticalAlign="top" height={40} formatter={() => ("Distribution / Liquidity")} wrapperStyle={{fontSize: "20px"}}/>
              <Area type="monotone" dataKey="Sum" stroke="#82ca9d" fillOpacity={0.5} fill="#82ca9d" />
            </AreaChart><li style={{color:'transparent'}}/> */}
              <div className={`common-title`} style={{ marginBottom: '40px', textAlign: "center", }}>Distribution / Liquidity</div>
                <AreaChart
                 width={460}
                  height={300}
                  margin={{
                    bottom: 44,
                    left: 0,
                    top: 20,
                  }}
                  data={cumulateTransfer}
                >
                  <defs>
                    <linearGradient
                      id="distributionLiquidity"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="10%"
                        stopColor="#ba00ff"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="50%"
                        stopColor="#d974ff"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="100%"
                        stopColor="#dc7fff"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    axisLine={false}
                    dataKey="Date"
                    tick={CustomTick}
                    stroke="#000"
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickFormatter={DataFormater}
                    tick={{ fontSize: 16 }}
                    stroke="#000"
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="0 0"
                    stroke="#f5f5f5"
                  />
                  <Area
                    strokeWidth={3}
                    type="monotone"
                    dataKey="Sum"
                    stroke="#ba00ff"
                    fill="url(#distributionLiquidity)"
                    activeDot={{
                      r: 8,
                      strokeWidth: 3,
                      stroke: "#ffffff",
                      fill: "#000000",
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#000",
                      strokeWidth: 1,
                      strokeDasharray: "2 2",
                    }}
                    itemStyle={{ color: "#8884d8" }}
                    formatter={NumberFormater}
                  />
                </AreaChart>
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
        <div className="row center">
          {cumulateBurn?
          // <div>
          //   <AreaChart width={290} height={250} data={cumulateBurn}>
          //     <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
          //     <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
          //     <CartesianGrid vertical={false} strokeDasharray="2 2" />
          //     <Tooltip formatter={NumberFormater} />
          //     <Legend verticalAlign="top" height={50} formatter={() => ("Burn")} wrapperStyle={{fontSize: "20px"}}/>
          //     <Area type="monotone" dataKey="Sum" stroke="#8884d8" fillOpacity={0.5} fill="#8884d8" />
          //   </AreaChart><li style={{color:'transparent'}}/>
          // </div>
          <div>
          <div className={`common-title`} style={{ marginBottom: '40px', textAlign: "center", }}>Burn</div>
          <AreaChart
                width={290} 
                height={250}
                data={cumulateBurn}
                margin={{
                  bottom: 44,
                  left: 0,
                  top: 20,
                }}
              >
                <defs>
                  <linearGradient id="Burn" x1="0" y1="0" x2="1" y2="1">
                    <stop
                      offset="10%"
                      stopColor="#fcdb5b"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="50%"
                      stopColor="#f7e01e"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="100%"
                      stopColor="#ffe95b"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  axisLine={false}
                  dataKey="Date"
                  tick={CustomTick}
                  stroke="#000"
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickFormatter={DataFormater}
                  tick={{ fontSize: 16 }}
                  stroke="#000"
                />
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="0 0"
                  stroke="#f5f5f5"
                />
                <Area
                  strokeWidth={3}
                  type="monotone"
                  dataKey="Sum"
                  stroke="#f7d509"
                  fill="url(#Burn)"
                  activeDot={{
                    r: 8,
                    strokeWidth: 3,
                    stroke: "#ffffff",
                    fill: "#000000",
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#000",
                    strokeWidth: 1,
                    strokeDasharray: "2 2",
                  }}
                  itemStyle={{ color: "#8884d8" }}
                  formatter={NumberFormater}
                />
              </AreaChart>
        </div>
          :<div></div>}
          {/* <div>  
            <AreaChart width={290} height={250} data={cumulateTransfer}>
              <XAxis dataKey="Date" tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <YAxis tickFormatter={DataFormater} tick={{fontSize: 14}} stroke="#A9A9A9"/>
              <CartesianGrid vertical={false} strokeDasharray="2 2" />
              <Tooltip formatter={NumberFormater} />
              <Legend verticalAlign="top" height={50} formatter={() => ("Distribution / Liquidity")} wrapperStyle={{fontSize: "20px"}}/>
              <Area type="monotone" dataKey="Sum" stroke="#82ca9d" fillOpacity={0.5} fill="#82ca9d" />
            </AreaChart><li style={{color:'transparent'}}/>
          </div> */}
            <div>  
              <div className={`common-title`} style={{ marginBottom: '40px', textAlign: "center", }}>Distribution / Liquidity</div>
                <AreaChart
                 width={290}
                  height={250}
                  margin={{
                    bottom: 44,
                    left: 0,
                    top: 20,
                  }}
                  data={cumulateTransfer}
                >
                  <defs>
                    <linearGradient
                      id="distributionLiquidity"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="10%"
                        stopColor="#ba00ff"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="50%"
                        stopColor="#d974ff"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="100%"
                        stopColor="#dc7fff"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    axisLine={false}
                    dataKey="Date"
                    tick={CustomTick}
                    stroke="#000"
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickFormatter={DataFormater}
                    tick={{ fontSize: 16 }}
                    stroke="#000"
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="0 0"
                    stroke="#f5f5f5"
                  />
                  <Area
                    strokeWidth={3}
                    type="monotone"
                    dataKey="Sum"
                    stroke="#ba00ff"
                    fill="url(#distributionLiquidity)"
                    activeDot={{
                      r: 8,
                      strokeWidth: 3,
                      stroke: "#ffffff",
                      fill: "#000000",
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#000",
                      strokeWidth: 1,
                      strokeDasharray: "2 2",
                    }}
                    itemStyle={{ color: "#8884d8" }}
                    formatter={NumberFormater}
                  />
                </AreaChart>
          </div>
        </div>
      </div>
      </MediaQuery>
    </div>

  );
}

