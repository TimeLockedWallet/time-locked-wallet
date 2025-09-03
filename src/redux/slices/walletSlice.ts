import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  publicKey: string;
}

const initialState: WalletState = {
  publicKey: "",
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    changePublicKey(state, action: PayloadAction<string>) {
      state.publicKey = action.payload;
    }
  }
})

export const { changePublicKey } = walletSlice.actions;
export default walletSlice.reducer;