import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface DepositState {
  info: Object | null;
}

const initialState: DepositState = {
  info: null,
}

const depositSlice = createSlice({
  name: "deposit",
  initialState,
  reducers: {
    changeInfo(state, action: PayloadAction<Object | null>) {
      state.info = action.payload;
    },
  }
})

export const { changeInfo } = depositSlice.actions;
export default depositSlice.reducer;