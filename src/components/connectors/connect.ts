import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";


export default async function useConnect(connector:Connector,hooks:Web3ReactHooks){
    const {useIsActive,useIsActivating,useAccount} = hooks
    const isActive = useIsActive()
    const isActivating = useIsActivating()
    const ac = useAccount()
    if (isActive) {
        if (connector?.deactivate){
          connector.deactivate()
        } else {
          connector.resetState()
        }
    } else if (!isActivating) {
        try{
          await connector.activate()
        } catch (err){
          connector.resetState()
          console.log(err)
        }
    }
    // return {}
}

// export default async function handleDisconnect(connector){

// }