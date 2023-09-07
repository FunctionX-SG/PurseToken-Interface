import { createSlice } from '@reduxjs/toolkit'

export const pursePriceSlice = createSlice({
  name: 'pursePrice',
  initialState: {
    value: 0,
  },
  reducers: {
    setValue: (state, action) => {
      state.value = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setValue } = pursePriceSlice.actions

export default pursePriceSlice.reducer