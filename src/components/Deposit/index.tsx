import React from 'react'
import { useState } from 'react'
import asterisk from '../../assets/images/asterisk.png'
import exlink from '../../assets/images/link.png'
import purse from '../../assets/images/purse.png'
import pancake from '../../assets/images/pancakeswap.png'
import bigInt from 'big-integer'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import '../App.css';
import { formatUnits, parseUnits } from 'ethers/lib/utils'


export default function Deposit(props: any) {
    const [message, setMessage] = useState('')
    const [amount, setAmount] = useState('')

    const onChangeHandler = (event: string) => {
        // console.log("event",!isNaN(parseFloat(event)))
        let result = !isNaN(parseFloat(event)); // true if its a number, false if not
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
            setMessage('')
            setAmount('')
        } else if (result === false) {
            setMessage('Not a valid number')
            setAmount('')
        } else if (parseFloat(event) <= 0) {
            setMessage('Value need to be greater than 0')
            setAmount('')
        } else if (afterDotResult === false){
            setMessage('Value cannot have more than 18 decimals')
            setAmount('')
        } else {
            setMessage('')
            setAmount(event)
        }
      }
    
    const onClickHandlerDeposit = () => {
        if (amount===''||amount==='0.0'){
            console.log("Deposit: Amount not valid")
            return
        }
        console.log("depositAmount",amount)
        const amountWei = parseUnits(amount, 'ether')
        if (amountWei.lte(0)) {
            alert("Amount cannot less than or equal to 0")
        } else if (amountWei.gt(props.lpTokenSegmentBalance[props.n][props.i])) {
            alert("Not enough funds")
        } else {
            props.deposit(props.i, amountWei, props.n)
        }
    }
    
    const onClickHandlerWithdraw = () => {
        if (amount===''||amount==='0.0'){
            console.log("Withdraw: Amount not valid")
            return
        }
        const amountWei = parseUnits(amount, 'ether')
        if (amountWei.lte(0)) {
            alert("Amount cannot less than or equal to 0")
        } else if (amountWei.gt(props.userSegmentInfo[props.n][props.i])) {
            alert("Withdraw tokens more than deposit LP tokens")
        } else {
            props.withdraw(props.i, amountWei, props.n)
        }
    }

    return (
        <div className="mt-0">
          <h2 className="center textWhite" style={{fontSize:"40px"}}><b>{props.poolSegmentInfo[props.n][props.i].token[props.farmNetwork]["symbol"]}-{props.poolSegmentInfo[props.n][props.i].quoteToken[props.farmNetwork]["symbol"]}</b></h2>
         
          <div className="center" style={{ fontFamily: 'Verdana', color: 'silver', textAlign:"center" }}>Deposit {props.poolSegmentInfo[props.n][props.i].token[props.farmNetwork]["symbol"]}-{props.poolSegmentInfo[props.n][props.i].quoteToken[props.farmNetwork]["symbol"]} LP Token and earn PURSE&nbsp;!</div>
          <br />
          <div className="card mb-3 cardbody" style={{ fontFamily: 'Verdana', color: 'silver'}}>
            <div className="card-body">
              <div className='float-left row mb-3 ml-1' style={{width:"70%"}}>
                <div className='dropdown' style={{ fontSize: '12px' }} onClick={() => {
                  window.open(props.poolSegmentInfo[props.n][props.i].getLPLink, '_blank')
                }}>Get {props.poolSegmentInfo[props.n][props.i].token[props.farmNetwork]["symbol"]}-{props.poolSegmentInfo[props.n][props.i].quoteToken[props.farmNetwork]["symbol"]} <img src={exlink} className='mb-1' height='10' alt="" />
                </div>
                <div className='dropdown' style={{ fontSize: '12px' }} onClick={() => {
                  window.open(props.poolSegmentInfo[props.n][props.i].lpContract, '_blank')
                }}>View&nbsp;Contract&nbsp;<img src={exlink} className='mb-1' height='10' alt="" />
                </div>
              </div>
  
              <button
                type="submit"
                className="btn btn-success btn-sm float-right center mb-3"
                style={{ position:'absolute', right:'20px' }}
                onClick={(event) => {
                  event.preventDefault()
                  props.harvest(props.i, props.n)
                }}>
                <small>Harvest</small>
              </button>  <br />  <br />
  
              <table className="table table-borderless text-center" style={{ color: 'silver', fontSize:'15px' }}>
                <thead>
                  <tr>
                    <th scope="col">{props.poolSegmentInfo[props.n][props.i].token[props.farmNetwork]["symbol"]}-{props.poolSegmentInfo[props.n][props.i].quoteToken[props.farmNetwork]["symbol"]} LP Staked </th>
                    <th scope="col">PURSE Earned</th>
                  </tr>
                  <tr>
                    <th scope="col"><img src={pancake} height='30' alt="" /></th>
                    <th scope="col"><img src={purse} height='34' alt="" /></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{parseFloat(props.userSegmentInfo[props.n][props.i]).toLocaleString('en-US', { maximumFractionDigits: 5 })}</td>
                    <td>{parseFloat(props.pendingSegmentReward[props.n][props.i]).toLocaleString('en-US', { maximumFractionDigits: 3 })}</td>
                  </tr>
                </tbody>
              </table>
  
  
              <div className="card mb-4 cardbody" >
                <div className="card-body">
                  {props.wallet || props.walletConnect ?
                  <div>
                      <div>
                        <label className="float-left mt-1" style={{ color: 'silver', fontSize: '15px', width: '40%', minWidth:"120px"}}><b>Start Farming</b></label>
                        <span className="float-right mb-2 mt-1" style={{ color: 'silver', fontSize: '15px' }}>
                          <span>
                            LP Balance&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {parseFloat(formatUnits(props.lpTokenSegmentBalance[props.n][props.i].toString(), 'ether')).toLocaleString('en-US', { maximumFractionDigits: 3 })}
                          </span>
                          <span><br />
                            PURSE Balance&nbsp;: {parseFloat(formatUnits(props.purseTokenUpgradableBalance, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 5 })}
                          </span>
                        </span>
                      </div>
                      <br /><br /><br />
  
                      {props.lpTokenSegmentAllowance[props.n][props.i] < 100000000000000000000000000000 ?
                        <div>
                        <form className="mb-3" onSubmit={(event) => {
                            event.preventDefault()}} >
                          <div className="input-group mt-0" >
                            <input
                              type="text"
                              style={{ color: 'silver', backgroundColor: '#28313b', fontSize: '15px' }}
                              className="form-control form-control-lg cardbody"
                              placeholder="0"
                              onPaste={(event)=>{
                                event.preventDefault()
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                onChangeHandler(value)
                              }}
                              value={amount}
                              required />
                            <div className="input-group-append">
                              <div className="input-group-text cardbody" style={{ color: 'silver', fontSize: '15px' }}>
                                <img src={pancake} height='20' alt="" />
                                &nbsp;&nbsp;LP
                              </div>
                            </div>
                          </div >
                          <div style={{ color: "#DC143C"  }}>{message} </div>
  
                          <div className="row center mt-3">
                            <ButtonGroup className='mt-2 ml-3'>
                              <Button type="submit" className="btn btn-primary"  style={{width:"105px"}} onClick={(event) => {
                                onClickHandlerDeposit()
                              }}>Deposit</Button>
                              <Button type="text" variant="outline-primary" className="btn" onClick={(event) => {
                                setAmount(formatUnits(props.lpTokenSegmentBalance[props.n][props.i], 'ether'))
                                onChangeHandler(formatUnits(props.lpTokenSegmentBalance[props.n][props.i], 'ether'))
                              }}>Max</Button>&nbsp;&nbsp;&nbsp;
                            </ButtonGroup>
                            <ButtonGroup  className='mt-2 ml-3'>
                              <Button type="submit" className="btn btn-primary" style={{width:"105px"}} onClick={(event) => {
                                onClickHandlerWithdraw()
                              }}>Withdraw</Button>
                              <Button type="text" variant="outline-primary" className="btn" onClick={(event) => {
                                setMessage('')
                                onChangeHandler(props.userSegmentInfo[props.n][props.i])
                              }}>Max</Button>&nbsp;&nbsp;&nbsp;
                            </ButtonGroup>
                          </div>
                        </form>
                        </div>
                        :
                        <div className="row center mt-3">
                          <button className="btn btn-primary btn-block" style={{width:"96%"}} onClick={(event) => {
                            console.log("abc")
                            props.approve(props.i, props.n)
                          }}>Approve</button>
                        </div>
                      }</div>
                    :
                    <div className="rowC center">
                      <button className="btn btn-primary" onClick={async () => {
                        await props.connectWallet()
                      }}>Connect Wallet</button>
                    </div>
                  }
                </div>
            </div>
          </div>
          </div>
          <div className="text-center" style={{ color: 'silver' }}><img src={asterisk} alt={"*"} height='15' />&nbsp;<small>Every time you stake & unstake LP tokens, the contract will automatically harvest PURSE rewards for you!</small></div>
        </div>
  
    );

}