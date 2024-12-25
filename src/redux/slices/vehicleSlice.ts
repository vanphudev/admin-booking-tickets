import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Vehicle } from '@/pages/management/vehicle/entity';

const initialState: {
   vehicles: Vehicle[];
   loading: boolean;
   error: string | null;
} = {
   vehicles: [],
   loading: false,
   error: null,
};

const vehicleSlice = createSlice({
   name: 'vehicle',
   initialState,
   reducers: {
      setVehiclesSlice: (state, action: PayloadAction<Vehicle[]>) => {
         state.vehicles = action.payload;
      },
      clearVehicle: (state) => {
         state.vehicles = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setVehiclesSlice, clearVehicle, setLoading, setError } = vehicleSlice.actions;
export const vehicleReducer = vehicleSlice.reducer;
