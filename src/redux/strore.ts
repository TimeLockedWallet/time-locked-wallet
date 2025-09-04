import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice'
import depositReducer from './slices/depositSlice'

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    deposit: depositReducer
  }
});