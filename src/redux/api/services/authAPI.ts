import { setUserInfoAndToken, clearUserInfoAndToken } from '@/redux/slices/userSlice';
import { store } from '@/redux/stores/store';
import { setItem, removeItem } from '@/utils/storage';

import apiClient from '../apiClient';

import { UserInfo, UserToken } from '#/entity';
import { StorageEnum } from '#/enum';

export interface SignInReq {
   username: string;
   password: string;
}

export interface UserStore {
   state: {
      userInfo: UserInfo;
      userToken: UserToken;
   };
}

export enum UserApi {
   SignIn = '/public/employee/auth/signin',
   Logout = '/private/employee/employee/auth/signout',
}

const signin = (data: SignInReq) => {
   return apiClient
      .post({ url: UserApi.SignIn, data })
      .then((res: any) => {
         if (res?.status === 201 || res?.status === 200) {
            const userInfo: UserInfo = {
               userId: res?.metadata?.employee?.employee_id,
               email: res?.metadata?.employee?.employee_email,
               phone: res?.metadata?.employee?.employee_phone,
               fullName: res?.metadata?.employee?.employee_full_name,
               gender: res?.metadata?.employee?.employee_gender,
               birthday: res?.metadata?.employee?.employee_birthday,
               username: res?.metadata?.employee?.employee_username,
               profileImage: res?.metadata?.employee?.employee_profile_image,
            };
            const userToken: UserToken = {
               accessToken: res?.metadata?.tokens?.accessToken,
               refreshToken: res?.metadata?.tokens?.refreshToken,
            };
            store.dispatch(
               setUserInfoAndToken({
                  userInfo,
                  userToken,
               }),
            );
            setItem(StorageEnum.UserInfo, userInfo);
            setItem(StorageEnum.UserToken, userToken);
         }
         return res;
      })
      .catch((error) => {
         return Promise.reject(error);
      });
};

const logout = () => {
   return apiClient
      .post({ url: UserApi.Logout })
      .then((res: any) => {
         if (res && (res.status === 200 || res.status === 201)) {
            store.dispatch(clearUserInfoAndToken());
            removeItem(StorageEnum.UserInfo);
            removeItem(StorageEnum.UserToken);
         }
         return res;
      })
      .catch((error) => {
         return Promise.reject(error);
      });
};

export default {
   signin,
   logout,
};
