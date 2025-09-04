import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  publicKey: string;
  rpcUrl: string;
}

const initialState: WalletState = {
  publicKey: "",
  rpcUrl: "https://api.devnet.solana.com"
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    changePublicKey(state, action: PayloadAction<string>) {
      state.publicKey = action.payload;
    },
    changeRpcUrl(state, action: PayloadAction<string>) {
      state.rpcUrl = action.payload;
    }
  }
})

export const { changePublicKey, changeRpcUrl } = walletSlice.actions;
export default walletSlice.reducer;