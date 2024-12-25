import { createSlice } from '@reduxjs/toolkit';
import type { Article } from '@/pages/management/article/entity';

const initialState: {
   articles: Article[];
   loading: boolean;
   error: string | null;
} = {
   articles: [],
   loading: false,
   error: null,
};

const articleSlice = createSlice({
   name: 'article',
   initialState,
   reducers: {
      setArticlesSlice: (state, action) => {
         state.articles = action.payload;
      },
      clearArticle: (state) => {
         state.articles = [];
      },
      setLoading: (state, action) => {
         state.loading = action.payload;
      },
   },
});

export const { setArticlesSlice } = articleSlice.actions;
export const articleReducer = articleSlice.reducer;
