import { createSlice } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import * as Constants from "../../../constants";

export const providerSlice = createSlice({
  name: "provider",
  initialState: {
    provider: {
      bscProvider: new ethers.providers.JsonRpcProvider(
        Constants.BSC_MAINNET_RPCURL
      ),
      fxProvider: new ethers.providers.JsonRpcProvider(Constants.PROVIDER),
      ethProvider: new ethers.providers.JsonRpcProvider(
        Constants.ETH_MAINNET_RPCURL
      ),
    },
  },
  reducers: {},
});

// Action creators are generated for each case reducer function
// export const { setTrigger } = ethProviderSlice.actions

export default providerSlice.reducer;
