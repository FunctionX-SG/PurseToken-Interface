import { createSlice } from '@reduxjs/toolkit'

export const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    value: []
  },
  reducers: {
    setToast: (state:any, action) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setToast } = toastSlice.actions

export default toastSlice.reducer