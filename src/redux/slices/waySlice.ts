import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Way } from '@/pages/management/way/entity';

const initialState: {
   ways: Way[];
   loading: boolean;
   error: string | null;
} = {
   ways: [],
   loading: false,
   error: null,
};

const waySlice = createSlice({
   name: 'way',
   initialState,
   reducers: {
      setWaysSlice: (state, action: PayloadAction<Way[]>) => {
            state.ways = action.payload;
      },
      clearWay: (state) => {
         state.ways = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setWaysSlice, clearWay, setLoading, setError } = waySlice.actions;
export const wayReducer = waySlice.reducer;
