import { initializeConnector } from "@web3-react/core";
import { WalletConnect as WalletConnectV2 } from "@web3-react/walletconnect-v2";

import { MAINNET_CHAINS } from "../chains";

const [BSC, ETH, ...optionalChains] = Object.keys(MAINNET_CHAINS).map(Number);

export const [walletConnectV2, hooks] = initializeConnector<WalletConnectV2>(
  (actions) =>
    new WalletConnectV2({
      actions,
      options: {
        projectId: "4a32ff3cb24de882c2a52a8536125cce",
        chains: [BSC, ETH],
        optionalChains,
        showQrModal: true,
      },
    })
);
