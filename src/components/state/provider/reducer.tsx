import { createSlice } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import * as Constants from '../../../constants'

export const providerSlice = createSlice({
  name: 'provider',
  initialState: {
    provider: {
      bscProvider: new ethers.providers.JsonRpcProvider(Constants.BSC_TESTNET_RPC_URL_S2),
      fxProvider: new ethers.providers.JsonRpcProvider(Constants.PROVIDER)
    }
  },
  reducers: {},
})

// Action creators are generated for each case reducer function
// export const { setTrigger } = ethProviderSlice.actions

export default providerSlice.reducer