import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Office } from '@/pages/management/office/entity';

const initialState: {
   offices: Office[];
   loading: boolean;
   error: string | null;
} = {
   offices: [],
   loading: false,
   error: null,
};

const officeSlice = createSlice({
   name: 'office',
   initialState,
   reducers: {
      setOfficesSlice: (state, action: PayloadAction<Office[]>) => {
         state.offices = action.payload;
      },
      clearOffices: (state) => {
         state.offices = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setOfficesSlice, clearOffices, setLoading, setError } = officeSlice.actions;
export const officeReducer = officeSlice.reducer;
