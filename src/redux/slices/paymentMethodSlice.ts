import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PaymentMethod } from '@/pages/management/method-payment/entity';

const initialState: {
   paymentMethods: PaymentMethod[];
   loading: boolean;
   error: string | null;
} = {
   paymentMethods: [],
   loading: false,
   error: null,
};

const paymentMethodSlice = createSlice({
   name: 'payment-method',
   initialState,
   reducers: {
      setPaymentMethodsSlice: (state, action: PayloadAction<PaymentMethod[]>) => {
         state.paymentMethods = action.payload;
      },
      clearPaymentMethod: (state) => {
         state.paymentMethods = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setPaymentMethodsSlice, clearPaymentMethod, setLoading, setError } = paymentMethodSlice.actions;
export const paymentMethodReducer = paymentMethodSlice.reducer;
