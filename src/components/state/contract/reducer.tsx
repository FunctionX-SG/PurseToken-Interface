import { createSlice } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import * as Constants from '../../../constants'
import PurseTokenUpgradable from '../../../abis/PurseTokenUpgradable.json'
import IPancakePair from '../../../abis/IPancakePair.json'
import MasterChefV2 from '../../../abis/MasterChefV2.json'
import PurseStaking from '../../../abis/PurseStaking.json'
import RestakingFarm from '../../../abis/RestakingFarm.json'
import RetroactiveRewards from '../../../abis/RetroactiveRewards.json'
import FIP20Upgradable from '../../../abis/FIP20Upgradable.json'

export const contractSlice =   
  createSlice({
    name: 'contract',
    initialState: () => {
      const bscProvider = new ethers.providers.JsonRpcProvider(Constants.BSC_MAINNET_RPCURL)
      const fxProvider = new ethers.providers.JsonRpcProvider(Constants.PROVIDER)
      const purseTokenUpgradable = new ethers.Contract(Constants.PURSE_TOKEN_UPGRADABLE_ADDRESS,PurseTokenUpgradable.abi, bscProvider);
      const retroactiveRewards = new ethers.Contract(Constants.RETROACTIVE_REWARDS_ADDRESS, RetroactiveRewards.abi, bscProvider)
      const restakingFarm = new ethers.Contract(Constants.RESTAKING_FARM_ADDRESS, RestakingFarm.abi, bscProvider)
      const purseStaking = new ethers.Contract(Constants.PURSE_STAKING_ADDRESS, PurseStaking.abi, bscProvider)
      const pancakeContract = new ethers.Contract(Constants.PANCAKE_PAIR_ADDRESS, IPancakePair.abi, bscProvider)
      const tokenOnFXCore = new ethers.Contract(Constants.FIP20UPGRADABLE_ADDRESS, FIP20Upgradable.abi, fxProvider)
      const masterChef = new ethers.Contract(Constants.MASTERCHEFV2_ADDRESS, MasterChefV2.abi, fxProvider)
      return {
        contract:  {
          purseTokenUpgradable,
          retroactiveRewards,
          restakingFarm,
          purseStaking,
          pancakeContract,
          tokenOnFXCore,
          masterChef
        }
    }},
    reducers: {},
  })



export default contractSlice.reducer