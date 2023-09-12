import { configureStore } from '@reduxjs/toolkit'
import walletTriggerReducer from './walletTrigger/reducer'
import providerReducer from './provider/reducer'
import contractReducer from './contract/reducer'
import toastReducer from './toast/reducer'
import pursePriceReducer from './PursePrice/reducer'
import networkReducer from './network/reducer'

export const store = configureStore({
  reducer: {
    walletTrigger: walletTriggerReducer,
    provider: providerReducer,
    contract: contractReducer,
    toast: toastReducer,
    pursePrice:pursePriceReducer,
    network: networkReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch