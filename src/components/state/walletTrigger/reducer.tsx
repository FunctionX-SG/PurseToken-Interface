import { createSlice } from '@reduxjs/toolkit'

export const walletTriggerSlice = createSlice({
  name: 'walletTrigger',
  initialState: {
    value: false,
  },
  reducers: {
    setTrigger: (state, action) => {
        state.value = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setTrigger } = walletTriggerSlice.actions

export default walletTriggerSlice.reducer