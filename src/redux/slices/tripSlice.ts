import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Trip } from '@/pages/routes/trip/entity';

const initialState: {
   trips: Trip[];
   loading: boolean;
   error: string | null;
} = {
   trips: [],
   loading: false,
   error: null,
};

const tripSlice = createSlice({
   name: 'trip',
   initialState,
   reducers: {
      setTripsSlice: (state, action: PayloadAction<Trip[]>) => {
         state.trips = action.payload;
      },
      clearTrip: (state) => {
         state.trips = [];
      },
   },
});

export const { setTripsSlice, clearTrip } = tripSlice.actions;
export const tripReducer = tripSlice.reducer;
