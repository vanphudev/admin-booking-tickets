// import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// import articleTypeAPI from '../api/services/articleTypeAPI';

// interface ArticleType {
//    article_type_id: number;
//    article_title: string;
//    article_field: string;
//    is_highlight: 0 | 1;
//    created_at?: string;
//    updated_at?: string;
//    deleted_at?: string | null;
// }

// interface ArticleTypeState {
//    articleTypes: ArticleType[];
//    loading: boolean;
//    error: string | null;
// }

// const initialState: ArticleTypeState = {
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { ArticleType } from '@/pages/management/articleType/entity';
// import articleTypeAPI from '../api/services/articleTypeAPI';

// const initialState: {
//    articleTypes: ArticleType[];
//    loading: boolean;
//    error: string | null;
// } = {
//    articleTypes: [],
//    loading: false,
//    error: null,
// };

// export const fetchArticleTypes = createAsyncThunk('articleType/getArticleTypes', async (_, { rejectWithValue }) => {
//    try {
//       const response = await articleTypeAPI.getArticleTypes();
//       return response;
//    } catch (error) {
//       return rejectWithValue(error.message);
//    }
// });

// export const createArticleType = createAsyncThunk(
//    'articleType/createArticleType',
//    async (data: Partial<ArticleType>, { rejectWithValue }) => {
//       try {
//          const response = await articleTypeAPI.createArticleType(data);
//          return response;
//       } catch (error) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const updateArticleType = createAsyncThunk(
//    'articleType/updateArticleType',
//    async (data: Partial<ArticleType>, { rejectWithValue }) => {
//       try {
//          const response = await articleTypeAPI.updateArticleType(data);
//          return response;
//       } catch (error) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const deleteArticleType = createAsyncThunk(
//    'articleType/deleteArticleType',
//    async (id: number, { rejectWithValue }) => {
//       try {
//          const response = await articleTypeAPI.deleteArticleType(id);
//          return { id, response };
//       } catch (error) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// const articleTypeSlice = createSlice({
//    name: 'articleType',
//    initialState,
//    reducers: {
//       clearArticleTypes: (state) => {
//          state.articleTypes = [];
//          state.error = null;
//       },
//    },
//    extraReducers: (builder) => {
//       // Get All
//       builder.addCase(fetchArticleTypes.pending, (state) => {
//          state.loading = true;
//          state.error = null;
//       });
//       builder.addCase(fetchArticleTypes.fulfilled, (state, action) => {
//          state.articleTypes = action.payload;
//          state.loading = false;
//       });
//       builder.addCase(fetchArticleTypes.rejected, (state, action) => {
//          state.error = action.payload as string;
//          state.loading = false;
//       });

//       // Create
//       builder.addCase(createArticleType.fulfilled, (state, action) => {
//          state.articleTypes.push(action.payload);
//       });

//       // Update
//       builder.addCase(updateArticleType.fulfilled, (state, action) => {
//          const index = state.articleTypes.findIndex((type) => type.article_type_id === action.payload.article_type_id);
//          if (index !== -1) {
//             state.articleTypes[index] = action.payload;
//          }
//       });

//       // Delete
//       builder.addCase(deleteArticleType.fulfilled, (state, action) => {
//          state.articleTypes = state.articleTypes.filter((type) => type.article_type_id !== action.payload.id);
//       });
//    },
// });

// export const { clearArticleTypes } = articleTypeSlice.actions;
// export const articleTypeReducer = articleTypeSlice.reducer;

// // Selectors
// export const selectArticleTypes = (state: { articleType: ArticleTypeState }) => state.articleType.articleTypes;
// export const selectArticleTypeLoading = (state: { articleType: ArticleTypeState }) => state.articleType.loading;
// export const selectArticleTypeError = (state: { articleType: ArticleTypeState }) => state.articleType.error;

// const articleTypeSlice = createSlice({
//    name: 'office',
//    initialState,
//    reducers: {
//       setArticleTypesSlice: (state, action: PayloadAction<ArticleType[]>) => {
//          state.articleTypes = action.payload;
//       },
//       clearArticleTypes: (state) => {
//          state.articleTypes = [];
//       },
//       setLoading: (state, action: PayloadAction<boolean>) => {
//          state.loading = action.payload;
//       },
//       setError: (state, action: PayloadAction<string | null>) => {
//          state.error = action.payload;
//       },
//    },
// });

// export const { setArticleTypesSlice, clearArticleTypes, setLoading, setError } = articleTypeSlice.actions;
// export const articleTypeReducer = articleTypeSlice.reducer;
