import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Route } from '@/pages/routes/route/entity';

const initialState: {
   routes: Route[];
   loading: boolean;
   error: string | null;
} = {
   routes: [],
   loading: false,
   error: null,
};

const routeSlice = createSlice({
   name: 'route',
   initialState,
   reducers: {
      setRoutesSlice: (state, action: PayloadAction<Route[]>) => {
         state.routes = action.payload;
      },
      clearRoute: (state) => {
         state.routes = [];
      },
   },
});

export const { setRoutesSlice, clearRoute } = routeSlice.actions;
export const routeReducer = routeSlice.reducer;
