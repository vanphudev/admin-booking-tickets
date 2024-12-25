import { lazy, useCallback, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDispatch } from 'react-redux';

import { getUsersById } from '@/redux/api/services/userAPI';
import { setUserInfo } from '@/redux/slices/userSlice';
import { AppDispatch } from '@/redux/stores/store';
import { useRouter } from '@/router/hooks';
import { getItem } from '@/utils/storage';

import { UserInfo } from '#/entity';
import { StorageEnum } from '#/enum';

const PageError = lazy(() => import('@/pages/sys/error/PageError'));

type Props = {
   children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
   const { replace } = useRouter();
   const { accessToken } = (getItem(StorageEnum.UserToken) as { accessToken: string }) || '';
   const userId = (getItem(StorageEnum.UserInfo) as { userId: string })?.userId || '';
   const dispatch = useDispatch<AppDispatch>();
   const check = useCallback(() => {
      if (!accessToken || !userId) {
         replace('/login');
         return;
      }
      getUsersById(userId).then((res: UserInfo) => {
         dispatch(setUserInfo(res));
      });
   }, [accessToken, dispatch, replace, userId]);

   useEffect(() => {
      check();
   }, [check]);

   return <ErrorBoundary FallbackComponent={PageError}>{children}</ErrorBoundary>;
}
