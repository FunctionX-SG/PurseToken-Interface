import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import bigInt from 'big-integer'
import '../App.css';
import { isAddress, formatUnits } from 'ethers/lib/utils'

export default function Rewards(props: any) {
    const [message, setMessage] = useState('')
    const [addValid, setAddValid] = useState(false)
    const [otherAddress, setOtherAddress] = useState('')
    const [otherAddressAmount, setOtherAddressAmount] = useState('')

    const onChangeHandler = (event: string) => {
        if (event === "") {
            setMessage('')
            setAddValid(false)
            setOtherAddress('')
        } else if (event !== "") {
            setOtherAddress(event)
            let result = isAddress(event); // Return true if it's a valid address, false if it's not
            if (result === false) {
                setMessage('Not a valid BEP-20 Address')
                setAddValid(false)
            } else {
                setMessage('')
                setAddValid(true)
            }
        }
    }

    const onClickCheck = async () => {
        if (addValid === false) {
            alert("Invalid input! Please check your input again")
        } else {
            let claimMessage = await props.checkRetroactiveRewardsAmount(otherAddress)
            let otherAddressAmount = parseFloat(formatUnits(claimMessage, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 6 }) + " PURSE (" + (parseFloat(formatUnits(claimMessage, 'ether'))*props.PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"
            setOtherAddressAmount(otherAddressAmount)
        }
    }

    return (
        <div id="content" className="mt-4">
            <label className="textWhite center mb-5" style={{ fontSize: '36px', textAlign:'center' }}><big><b>PURSE<br/>Retroactive Rewards</b></big></label>
            <div className="row center">
                <div className="card cardbody mb-3 ml-3 mr-3" style={{ width: '450px', minHeight: '400px', color: 'white' }}>
                    <div className="card-body">
                        <span>
                            <table className=" textWhiteSmall text-center mb-4" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th scope="col">Start Date</th>
                                        <th scope="col">End Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{props.retroactiveRewardsStartDate}</td>
                                        <td>{props.retroactiveRewardsEndDate}</td>
                                    </tr>
                                </tbody>
                                <tbody>
                                    <tr>
                                        <td>SGT (GMT +8)</td>
                                        <td>SGT (GMT +8)</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="textWhiteSmall ml-3 mb-2"><b>Remarks:</b></div>
                            <ul>
                                <li className="textWhiteSmaller">838 Million PURSE will be given out to Early Stakers as Retroactive Rewards</li>
                                <li className="textWhiteSmaller">Make sure your wallet is connected to BSC network.</li>
                                <li className="textWhiteSmaller">Make sure you have sufficient BNB to pay for the transaction fees.</li>
                                <li className="textWhiteSmaller">Click on Claim and confirm the transaction to claim your PURSE tokens.</li>
                                <li className="textWhiteSmaller">Note that you cannot claim after the End Date.</li>
                            </ul>
                        </span>
                    </div>
                </div>
                {props.wallet || props.walletConnect ?
                    <div className="card cardbody mb-3" style={{ width: '450px', minHeight: '400px', color: 'white' }}>
                        <div className="card-body">
                            <div>
                                <div>
                                    <div className="textWhiteSmall mb-1"><b>Address:</b></div>
                                    <div className="textWhiteSmall mb-2"><b>{props.account}</b></div>
                                </div>
                                <div>
                                    <div className="textWhiteSmall mb-1"><b>Retroactive Rewards:</b></div>
                                    <div className="textWhiteSmall mb-1"><b>{parseFloat(formatUnits(props.retroactiveRewardsAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 6 }) + " PURSE (" + (parseFloat(formatUnits(props.retroactiveRewardsAmount, 'ether'))*props.PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"}</b></div>
                                </div>
                                {(Date.now() / 1000).toFixed(0) > props.retroactiveRewardsEndTime || (Date.now() / 1000).toFixed(0) < props.retroactiveRewardsStartTime ?
                                    <div>{(Date.now() / 1000).toFixed(0) < props.retroactiveRewardsStartTime ?
                                        <div className="center mt-2 mb-4">
                                            <Button
                                                disabled
                                                className="btn-block"
                                                variant="secondary"
                                                size="sm"
                                                style={{ minWidth: '80px' }}
                                                >Not Started
                                            </Button>
                                        </div>   
                                        :
                                        <div className="center mt-2 mb-4">
                                            <Button
                                                disabled
                                                className="btn-block"
                                                variant="secondary"
                                                size="sm"
                                                style={{ minWidth: '80px' }}
                                                >Ended
                                            </Button>
                                        </div>  
                                    }</div>
                                :
                                    <div>{props.retroactiveRewardsIsClaim === false ? 
                                        (props.retroactiveRewardsAmount === "0" ?
                                            <div className="center mt-2 mb-4">
                                                <Button
                                                    disabled
                                                    className="btn-block"
                                                    variant="secondary"
                                                    size="sm"
                                                    style={{ minWidth: '80px' }}
                                                    >Not Available
                                                </Button>
                                            </div>   
                                            :
                                            <div className="center mt-2 mb-4">
                                                <Button
                                                    className="btn-block"
                                                    variant="success"
                                                    size="sm"
                                                    style={{ minWidth: '80px' }}
                                                    onClick={(event) => {
                                                        event.preventDefault()
                                                        props.claimRetroactiveRewardsAmount()
                                                    }}>Claim
                                                </Button>
                                            </div>          
                                        )
                                    :                              
                                        <div className="center mt-2 mb-4">
                                            <Button
                                                disabled
                                                className="btn-block"
                                                variant="secondary"
                                                size="sm"
                                                style={{ minWidth: '80px' }}
                                                >Claimed
                                            </Button>
                                        </div>
                                    }</div>
                                }
                                <div className="float-left">
                                    <div className="textWhiteSmall mt-2 mb-2" ><b>Check Other Address:</b></div>
                                </div>
                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                }}>
                                    <div>
                                        <div className="input-group" >
                                            <input
                                                type="text"
                                                style={{ color: 'white', backgroundColor: '#28313B' }}
                                                className="form-control form-control-sm cardbody"
                                                placeholder="BSC Address"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    onChangeHandler(value)
                                                }}
                                                value={otherAddress}
                                                required />
                                        </div >
                                        <div className="textWhiteSmall mt-1" style={{ color: '#DC143C' }}>{message} </div>
                                        <div className="center mt-2 mb-2">
                                            <Button type="submit" className="btn btn-block btn-primary btn-sm" onClick={onClickCheck}>Check</Button>
                                        </div>
                                        <div className="textWhiteSmall"><b>{otherAddressAmount}</b></div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="card cardbody mb-3" style={{ width: '450px', minHeight: '400px', color: 'white' }}>
                        <div className="card-body">
                            <div style={{transform: "translate(0%, 120%)"}}>
                                <div className="center textWhiteMedium"><b>Connect wallet to claim PURSE</b></div>
                                <div className="center"><button type="submit" className="btn btn-primary mt-4" onClick={async () => {
                                    await props.connectWallet()
                                }}>Connect</button></div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div >

    );
}

