import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

import { clearUserInfoAndToken, setUserInfoAndToken } from '@/redux/slices/userSlice';
import { store } from '@/redux/stores/store';
import { getItem, removeItem, setItem } from '@/utils/storage';
import { UserInfo, UserToken } from '#/entity';
import { StorageEnum } from '#/enum';

const axiosInstance = axios.create({
   baseURL: import.meta.env.VITE_APP_BASE_API,
   timeout: 50000,
   headers: { 'Content-Type': 'application/json;charset=utf-8' },
});

axiosInstance.interceptors.request.use(
   (config) => {
      config.headers.Authorization = (getItem(StorageEnum.UserToken) as { accessToken: string })?.accessToken;
      config.headers.Client_ID = (getItem(StorageEnum.UserInfo) as { userId: string })?.userId;
      return config;
   },
   (error) => {
      return Promise.reject(error);
   },
);

export enum UserApi {
   RefreshToken = '/public/employee/auth/refresh-token',
}

interface RefreshTokenResponse {
   userInfo: UserInfo;
   userToken: UserToken;
}

async function refreshToken(): Promise<RefreshTokenResponse | undefined> {
   try {
      const response: any = await axiosInstance.post(UserApi.RefreshToken, {
         refreshToken: (getItem(StorageEnum.UserToken) as { refreshToken: string })?.refreshToken,
         employeeId: (getItem(StorageEnum.UserInfo) as { userId: string })?.userId,
      });
      if (response && (response?.status === 201 || response?.status === 200)) {
         const userInfo: UserInfo = {
            userId: response?.metadata?.employee?.employee_id,
            email: response?.metadata?.employee?.employee_email,
            phone: response?.metadata?.employee?.employee_phone,
            fullName: response?.metadata?.employee?.employee_full_name,
            gender: response?.metadata?.employee?.employee_gender,
            birthday: response?.metadata?.employee?.employee_birthday,
            username: response?.metadata?.employee?.employee_username,
            profileImage: response?.metadata?.employee?.employee_profile_image,
         };
         const userToken: UserToken = {
            accessToken: response?.metadata?.tokens?.accessToken,
            refreshToken: response?.metadata?.tokens?.refreshToken,
         };
         return {
            userInfo,
            userToken,
         };
      }
   } catch (error) {
      return Promise.reject(error);
   }
}

axiosInstance.interceptors.response.use(
   (res: AxiosResponse<any>) => {
      const { data } = res.data;
      const hasSuccess = data && Reflect.has(res.data, 'status');
      if (hasSuccess) {
         return res?.data;
      }
      return res?.data;
   },
   async (error: AxiosError<any>) => {
      const { response } = error || {};
      const status = response?.status;
      if (status === 401) {
         store.dispatch(clearUserInfoAndToken());
         removeItem(StorageEnum.UserInfo);
         removeItem(StorageEnum.UserToken);
         window.location.href = '/login';
         return Promise.reject(error?.response?.data);
      }
      if (status === 500) {
         // window.location.href = '/500';
         // return Promise.reject(error?.response?.data);
      }
      if (status === 419) {
         try {
            const newToken = await refreshToken();
            if (newToken) {
               setItem(StorageEnum.UserInfo, newToken.userInfo);
               setItem(StorageEnum.UserToken, newToken.userToken);
               axiosInstance.defaults.headers.common.Authorization = newToken.userToken.accessToken;
               axiosInstance.defaults.headers.common.Client_ID = newToken.userInfo.userId;
               store.dispatch(setUserInfoAndToken(newToken));
            }
            if (error.config) {
               return await axiosInstance.request(error.config);
            }
         } catch (refreshError) {
            store.dispatch(clearUserInfoAndToken());
            removeItem(StorageEnum.UserInfo);
            removeItem(StorageEnum.UserToken);
            window.location.href = '/login';
            return refreshError;
         }
      }
      return Promise.reject(error?.response?.data);
   },
);

class APIClient {
   get(config: AxiosRequestConfig) {
      return this.request({ ...config, method: 'GET' });
   }

   post(config: AxiosRequestConfig) {
      return this.request({ ...config, method: 'POST' });
   }

   put(config: AxiosRequestConfig) {
      return this.request({ ...config, method: 'PUT' });
   }

   delete(config: AxiosRequestConfig) {
      return this.request({ ...config, method: 'DELETE' });
   }

   request(config: AxiosRequestConfig) {
      return new Promise((resolve, reject) => {
         axiosInstance
            .request<any, AxiosResponse<any>>(config)
            .then((res: AxiosResponse<any>) => {
               resolve(res);
            })
            .catch((e: Error | AxiosError) => {
               reject(e);
            });
      });
   }
}

export default new APIClient();
