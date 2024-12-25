import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
   provinces: any[];
   districts: any[];
   wards: any[];
} = {
   provinces: [],
   districts: [],
   wards: [],
};

const addressSlice = createSlice({
   name: 'address',
   initialState,
   reducers: {
      setProvinces: (state, action: PayloadAction<any[]>) => {
         state.provinces = action.payload;
      },
      clearProvinces: (state) => {
         state.provinces = [];
      },
      setDistricts: (state, action: PayloadAction<any[]>) => {
         state.districts = action.payload;
      },
      clearDistricts: (state) => {
         state.districts = [];
      },
      setWards: (state, action: PayloadAction<any[]>) => {
         state.wards = action.payload;
      },
      clearWards: (state) => {
         state.wards = [];
      },
   },
});

export const { setProvinces, clearProvinces, setDistricts, clearDistricts, setWards, clearWards } =
   addressSlice.actions;

export const addressReducer = addressSlice.reducer;
