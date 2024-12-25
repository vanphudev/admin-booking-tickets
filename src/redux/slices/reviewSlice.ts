import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Review } from '@/pages/management/review/entity';

const initialState: {
   reviews: Review[];
   loading: boolean;
   error: string | null;
} = {
   reviews: [],
   loading: false,
   error: null,
};

const reviewSlice = createSlice({
   name: 'review',
   initialState,
   reducers: {
      setReviewsSlice: (state, action: PayloadAction<Review[]>) => {
         state.reviews = action.payload;
      },
      clearReviews: (state) => {
         state.reviews = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setReviewsSlice, clearReviews, setLoading, setError } = reviewSlice.actions;
export const reviewReducer = reviewSlice.reducer;
