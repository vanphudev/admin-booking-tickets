import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Customer } from '@/pages/users/customer/entity';

const initialState: {
   customers: Customer[];
   loading: boolean;
   error: string | null;
} = {
   customers: [],
   loading: false,
   error: null,
};

const customerSlice = createSlice({
   name: 'customer',
   initialState,
   reducers: {
      setCustomerSlice: (state, action: PayloadAction<Customer[]>) => {
         state.customers = action.payload;
      },
      clearCustomer: (state) => {
         state.customers = [];
      },
   },
});

export const { setCustomerSlice, clearCustomer } = customerSlice.actions;
export const customerReducer = customerSlice.reducer;
