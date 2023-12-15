import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import '../App.css';
import { isAddress, formatUnits, getAddress } from 'ethers/lib/utils'
import UserAmount from '../../abis/userAmount.json'
import { BigNumber } from 'ethers'
import { timeConverter, isSupportedChain, callContract, getShortTxHash, getMerkleProof, getMerkleProofUserAmount, isUserInList, formatBigNumber } from '../utils';
import { useWeb3React } from '@web3-react/core';
import { Loading } from '../Loading';
import { useToast } from '../state/toast/hooks';
import { useProvider } from '../state/provider/hooks';
import { usePursePrice } from '../state/PursePrice/hooks';
import { useContract } from '../state/contract/hooks';
import { useWalletTrigger } from '../state/walletTrigger/hooks';
import { useNetwork } from '../state/network/hooks';
import Popup from '../Popup';
import UserRewardAmount from '../../constants/purseBusdUserAmounts.json'


export default function Rewards() {
    const {isActive, account, chainId} = useWeb3React()
    const [,switchNetwork] = useNetwork()
    const [PURSEPrice] = usePursePrice()
    const {signer} = useProvider()
    const [,showToast] = useToast()

    const {retroactiveRewards,rewardContract} = useContract()

    const [message, setMessage] = useState('')
    const [addValid, setAddValid] = useState(false)
    const [otherAddress, setOtherAddress] = useState('')
    const [otherAddressAmount, setOtherAddressAmount] = useState('')
    const [retroactiveRewardsAmount, setRetroactiveRewardsAmount] = useState<BigNumber>(BigNumber.from("0"))
    const [retroactiveRewardsIsClaim, setRetroactiveRewardsIsClaim] = useState<Boolean>(false)
    const [retroactiveRewardsStartTime, setRetroactiveRewardsStartTime] = useState<number>(0)
    const [retroactiveRewardsEndTime, setRetroactiveRewardsEndTime] = useState<number>(0)
    const [, setTrigger] = useWalletTrigger()
    const [isLoading, setIsLoading] = useState(true)
    const [isClaim, setIsClaim] = useState(false)

    useEffect(() => {
        async function getRewardData(){
            const _retroactiveRewardsStartTime = await retroactiveRewards.rewardStartTime()
            const _retroactiveRewardsEndTime = await retroactiveRewards.rewardEndTime()
            setRetroactiveRewardsStartTime(_retroactiveRewardsStartTime)
            setRetroactiveRewardsEndTime(_retroactiveRewardsEndTime)
            if (isActive===true){
                const _retroactiveRewardsIsClaim = await retroactiveRewards.isClaim(account)
                const _retroactiveRewardsAmount = checkRetroactiveRewardsAmount(account)
                setRetroactiveRewardsIsClaim(_retroactiveRewardsIsClaim)
                setRetroactiveRewardsAmount(_retroactiveRewardsAmount)
            }
            setIsLoading(false)
        }
        getRewardData()
    },[isActive, account, retroactiveRewards])

    const checkRetroactiveRewardsAmount = (address:string|undefined) => {
        if (!address) return BigNumber.from('0')
        let newAddress = getAddress(address)
        let retroactiveRewardsAmount: any
        if(UserAmount[newAddress as keyof typeof UserAmount] !== undefined){
          retroactiveRewardsAmount = UserAmount[newAddress as keyof typeof UserAmount]["Amount"]
        } else{
          retroactiveRewardsAmount = BigNumber.from("0")
        }
        return retroactiveRewardsAmount
    }
    
    const claimRetroactiveRewardsAmount = async () => {
        if (parseFloat((Date.now() / 1000).toFixed(0)) > retroactiveRewardsEndTime) {
            showToast("Claim Ended","failure")
        } else if (parseFloat((Date.now() / 1000).toFixed(0)) < retroactiveRewardsStartTime) {
            showToast("Claim Not Started","failure")
        } else {
          if (retroactiveRewardsAmount.eq(0)) {
            showToast("No Reward Available","failure")
          } else {
            let address = getAddress(account||'')
            let merkleProof = await getMerkleProof(address)
            if (isActive === true) {
                try{
                    const tx:any = await callContract(signer,retroactiveRewards,"claimRewards",retroactiveRewardsAmount,merkleProof)
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
        }
    }

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
            showToast("Invalid input! Please check your input again","failure")
        } else {
            let claimMessage = await checkRetroactiveRewardsAmount(otherAddress)
            let otherAddressAmount = parseFloat(formatUnits(claimMessage, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 6 }) + " PURSE (" + (parseFloat(formatUnits(claimMessage, 'ether'))*PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"
            setOtherAddressAmount(otherAddressAmount)
        }
    }

    const onClickClaimReward = async() => {
        if(account && isUserInList(account,UserRewardAmount)){
            const merkleProof = await getMerkleProofUserAmount(account,UserRewardAmount)
            const rewardAmountWei = BigNumber.from(rewardAmount)
            // console.log('merkleProof',merkleProof,rewardAmountWei,rewardAmount)
            if (isActive === true) {
                try{
                    const tx:any = await callContract(signer,rewardContract,"claimRewards",rewardAmountWei,merkleProof)
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
        }else {
            console.log('user not in list')
        }
        
    }

    const [showClaim,setShowClaim] = useState(false)
    const [rewardAmount,setRewardAmount] = useState(account?UserRewardAmount[account as keyof typeof UserRewardAmount]?.Amount:"")

    useEffect(()=>{
        const setClaim = async() => {
            if (isSupportedChain(chainId)) {
                const isClaimed = await rewardContract.isClaim(account,0) //false false true
                // const canClaim = true
                setShowClaim(isUserInList(account,UserRewardAmount)&&!isClaimed)
                setRewardAmount(UserRewardAmount[account as keyof typeof UserRewardAmount]?.Amount)
            }
        }
        setClaim()
    },[account,chainId])
    // console.log(BigNumber.from(rewardAmount),formatBigNumber(BigNumber.from(rewardAmount),'ether'))
    return (
        <div id="content" className="mt-4">
            <Popup trigger={showClaim} setTrigger={setShowClaim} width="400px">
                <div className="container-fluid">
                    <div>
                        <div className="textWhiteMedium mb-3 center" style={{padding: "5px"}}>
                        Claim Your Reward
                        </div>
                        <div className="mb-3 mr-3 center" style={{color:"white"}}>Amount: {parseFloat(formatBigNumber(BigNumber.from(rewardAmount||'0'),'ether')).toLocaleString('en-US', { maximumFractionDigits: 5 })} PURSE</div>
                        <div className="center">
                        <Button className="center" type="button" variant="primary" style={{minWidth:"150px",maxWidth:"250px", padding:"6px 32px"}} onClick={async () => {
                            await onClickClaimReward()
                            // setShowClaim(false)
                        }}>
                            &nbsp;Claim
                        </Button></div>
                    </div>
                </div>
            </Popup>
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
                                    {isLoading?
                                    <tr>
                                        <td><Loading/></td>
                                        <td><Loading/></td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>{timeConverter(retroactiveRewardsStartTime)}</td>
                                        <td>{timeConverter(retroactiveRewardsEndTime)}</td>
                                    </tr>
                                    }
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
                {!isActive?
                <div className="card cardbody mb-3" style={{ width: '450px', minHeight: '400px', color: 'white' }}>
                    <div className="card-body">
                        <div style={{transform: "translate(0%, 150%)"}}>
                            <div className="center textWhiteMedium"><b>Connect wallet to claim PURSE</b></div>
                            <div className="center"><button type="submit" className="btn btn-primary mt-4" onClick={async () => {
                                setTrigger(true)
                            }}>Connect</button></div>
                        </div>
                    </div>
                </div>
                :
                !isSupportedChain(chainId)?
                <div className="card cardbody mb-3" style={{ width: '450px', minHeight: '400px', color: 'white' }}>
                <div className="card-body">
                    <div style={{transform: "translate(0%, 150%)"}}>
                        <div className="center textWhiteMedium"><b>Switch chain to claim PURSE</b></div>
                        <div className="center"><button type="submit" className="btn btn-primary mt-4" onClick={async () => {
                            switchNetwork()
                        }}>Switch</button></div>
                        </div>
                    </div>
                </div>
                :<>
                    <div className="card cardbody mb-3" style={{ width: '450px', minHeight: '400px', color: 'white' }}>
                        <div className="card-body">
                            <div>
                                <div>
                                    <div className="textWhiteSmall mb-1"><b>Address:</b></div>
                                    <div className="textWhiteSmall mb-2"><b>{account}</b></div>
                                </div>
                                <div>
                                    <div className="textWhiteSmall mb-1"><b>Retroactive Rewards:</b></div>
                                    <div className="textWhiteSmall mb-1">
                                        {isLoading?
                                        <Loading/>
                                        :
                                        <b>{parseFloat(formatUnits(retroactiveRewardsAmount, 'ether')).toLocaleString('en-US', { maximumFractionDigits: 6 }) + " PURSE (" + (parseFloat(formatUnits(retroactiveRewardsAmount, 'ether'))*PURSEPrice).toLocaleString('en-US', { maximumFractionDigits: 5 }) + " USD)"}</b>
                                        }
                                    </div>
                                </div>
                                {isLoading?
                                <div className="center mt-2 mb-4">
                                    <Button
                                        disabled
                                        className="btn-block"
                                        variant="secondary"
                                        size="sm"
                                        style={{ minWidth: '80px' }}
                                        ><Loading/>
                                    </Button>
                                </div>
                                :
                                <div>
                                {parseFloat((Date.now() / 1000).toFixed(0)) > retroactiveRewardsEndTime || parseFloat((Date.now() / 1000).toFixed(0)) < retroactiveRewardsStartTime ?
                                    <div>{parseFloat((Date.now() / 1000).toFixed(0)) < retroactiveRewardsStartTime ?
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
                                    <div>{retroactiveRewardsIsClaim === false ? 
                                        (retroactiveRewardsAmount.eq(0) ?
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
                                                    onClick={async(event) => {
                                                        event.preventDefault()
                                                        setIsClaim(true)
                                                        await claimRetroactiveRewardsAmount()
                                                        setIsClaim(false)
                                                    }}>{isClaim?<Loading/>:<div>Claim</div>}
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
                                </div>
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
                    
                </>}
            </div>
        </div >

    );
}

