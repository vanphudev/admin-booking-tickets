import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Refund } from '@/pages/management/refunds/entity';

const initialState: {
   refunds: Refund[];
   loading: boolean;
   error: string | null;
} = {
   refunds: [],
   loading: false,
   error: null,
};

const refundSlice = createSlice({
   name: 'refund',
   initialState,
   reducers: {
      setRefundsSlice: (state, action: PayloadAction<Refund[]>) => {
         state.refunds = action.payload;
      },
      clearRefund: (state) => {
         state.refunds = [];
      },
   },
});

export const { setRefundsSlice, clearRefund } = refundSlice.actions;
export const refundReducer = refundSlice.reducer;
