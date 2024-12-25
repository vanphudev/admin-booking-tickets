import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { UserApi } from '../api/services/userAPI';

import * as userAPI from '@/redux/api/services/userAPI';

import { UserInfo, UserToken } from '#/entity';

export interface UserState {
   userInfo: Partial<UserInfo>;
   userToken: UserToken;
}

const initialState: UserState = {
   userInfo: {},
   userToken: {},
};

// Tạo async thunk để lấy thông tin người dùng
export const fetchUserById = createAsyncThunk('user/fetchById', async (id: string) => {
   const userInfo = await userAPI.getUsersById(id);
   return userInfo;
});

const userSlice = createSlice({
   name: 'user',
   initialState,
   reducers: {
      setUserInfo: (state, action: PayloadAction<UserInfo>) => {
         state.userInfo = action.payload;
      },
      setUserToken: (state, action: PayloadAction<UserToken>) => {
         state.userToken = action.payload;
      },
      clearUserInfoAndToken: (state) => {
         state.userInfo = {};
         state.userToken = {};
      },
      setUserInfoAndToken: (state, action: PayloadAction<{ userInfo: UserInfo; userToken: UserToken }>) => {
         state.userInfo = action.payload.userInfo;
         state.userToken = action.payload.userToken;
      },
   },
   extraReducers: (builder) => {
      builder.addCase(fetchUserById.fulfilled, (state, action) => {
         state.userInfo = action.payload; // Lưu thông tin người dùng vào state
      });
   },
});

export const { setUserInfo, setUserToken, clearUserInfoAndToken, setUserInfoAndToken } = userSlice.actions;

export const userReducer = userSlice.reducer;