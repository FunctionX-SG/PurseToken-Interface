import { createSlice } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import * as Constants from '../../../constants'
import PurseTokenUpgradable from '../../../abis/PurseTokenUpgradable.json'
import IPancakePair from '../../../abis/IPancakePair.json'
import MasterChefV2 from '../../../abis/MasterChefV2.json'
import PurseStaking from '../../../abis/PurseStaking.json'
import PurseStakingVesting from '../../../abis/PurseStakingVesting.json'
import Treasury from '../../../abis/Treasury.json'
import RestakingFarm from '../../../abis/RestakingFarm.json'
import RetroactiveRewards from '../../../abis/RetroactiveRewards.json'
import FIP20Upgradable from '../../../abis/FIP20Upgradable.json'
import RewardDistributor from '../../../abis/RewardDistributor.json'
import RewardContract from '../../../abis/RewardContract.json'

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
      const purseStakingVesting = new ethers.Contract(Constants.PURSE_STAKING_VESTING_ADDRESS, PurseStakingVesting.abi, bscProvider)
      const treasuryContract = new ethers.Contract(Constants.TREASURY_ADDRESS,Treasury.abi,bscProvider)
      const rewardDistributor = new ethers.Contract(Constants.REWARD_DISTRIBUTOR_ADDRESS,RewardDistributor.abi,bscProvider)
      const rewardContract = new ethers.Contract(Constants.REWARD_ADDRESS,RewardContract.abi,bscProvider)
      const tokenOnFXCore = new ethers.Contract(Constants.FIP20UPGRADABLE_ADDRESS, FIP20Upgradable.abi, fxProvider)
      const masterChef = new ethers.Contract(Constants.MASTERCHEFV2_ADDRESS, MasterChefV2.abi, fxProvider)

      return {
        contract:  {
          purseTokenUpgradable,
          retroactiveRewards,
          restakingFarm,
          purseStaking,
          purseStakingVesting,
          tokenOnFXCore,
          masterChef,
          treasuryContract,
          rewardDistributor,
          rewardContract
        }
    }},
    reducers: {},
  })



export default contractSlice.reducer