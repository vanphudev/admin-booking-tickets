import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Voucher } from '@/pages/management/voucher/entity';

const initialState: {
   vouchers: Voucher[];
   loading: boolean;
   error: string | null;
} = {
   vouchers: [],
   loading: false,
   error: null,
};

export const voucherSlice = createSlice({
   name: 'voucher',
   initialState,
   reducers: {
      setVouchersSlice: (state, action: PayloadAction<Voucher[]>) => {
         state.vouchers = action.payload;
      },
      clearVouchers: (state) => {
         state.vouchers = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setVouchersSlice, clearVouchers, setLoading, setError } = voucherSlice.actions;
export const voucherReducer = voucherSlice.reducer;
