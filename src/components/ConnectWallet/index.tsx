import React from 'react'
import Popup from '../Popup'
import Button from 'react-bootstrap/Button'
import fox from '../../assets/images/metamask-fox.svg'
import walletconnectLogo from '../../assets/images/walletconnect-logo.svg'
import { useWeb3React } from '@web3-react/core'
import { metaMask } from '../connectors/metamask'
import { walletConnectV2 } from '../connectors/walletConnect'
import { useToast } from '../state/toast/hooks';
import { useWalletTrigger } from '../state/walletTrigger/hooks'

export default function ConnectWallet(props:any) {
    const [trigger, setTrigger] = useWalletTrigger()
    const { isActive, isActivating } = useWeb3React()
    const [,showToast] = useToast()

    const metamaskConnect = async () => {
        if (isActive) {
          if (metaMask?.deactivate){
            metaMask.deactivate()
          } else {
            metaMask.resetState()
          }
        } else if (!isActivating) {
          try{
            await metaMask.activate()
            localStorage.setItem('isWalletConnected','metamask')
          } catch (err){
            metaMask.resetState()
            console.log(err)
          }
        }
      }
    
      const WalletConnectV2 = async () => {
        if (isActive) {
          if (walletConnectV2?.deactivate){
            walletConnectV2.deactivate()
          } else {
            walletConnectV2.resetState()
          }
        } else if (!isActivating) {
          try{
            if (showToast) showToast("If WalletConnect doesn't pop up, try to refresh the page.","warning")
            await walletConnectV2.activate()
            localStorage.setItem('isWalletConnected','wc2')
          } catch (err){
            walletConnectV2.resetState()
            console.log(err)
          }
        }
      }


    return (
        <Popup trigger={trigger} setTrigger={setTrigger}>
            <div className="container-fluid">
                <div>
                    <div className="textWhiteMedium mb-2" style={{borderBottom: "1px Solid Gray", padding: "10px"}}>
                    Connect a Wallet
                    </div>
                    <div className="center mt-4 mb-3">
                    <Button type="button" variant="secondary" style={{minWidth:"150px",maxWidth:"250px", padding:"6px 32px"}} onClick={async () => {
                        await metamaskConnect()
                        setTrigger(false)
                    }}>
                        <img src={fox} width="23" height="23" alt=""/>
                        &nbsp;Metamask
                    </Button>
                    <span style={{width:"15px"}}/>
                    <Button type="button" variant="secondary" style={{minWidth: "150px",maxWidth:"250px"}} onClick={async () => {
                        await WalletConnectV2()
                        setTrigger(false)
                    }}>
                        <img src={walletconnectLogo} width="26" height="23" alt=""/>
                        &nbsp;WalletConnect
                    </Button>
                    </div>
                </div>
            </div>
        </Popup>
    )
}