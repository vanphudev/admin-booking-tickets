import apiClient from '@/redux/api/apiClient';

export enum CustomerApi {
   GetCustomers = '/private/employee/customer-employee/getall',
   LockAccount = '/private/employee/customer-employee/lockaccount',
   UnlockAccount = '/private/employee/customer-employee/unlockaccount',
   CountCustomer = '/private/employee/customer-employee/count',
}

const getCustomers = async (): Promise<any> => {
   return apiClient
      .get({ url: CustomerApi.GetCustomers })
      .then((res: any) => {
         if (res?.metadata?.customers) {
            return res?.metadata?.customers;
         }
         return null;
      })
      .catch((error) => {
         return error;
      });
};

const lockAccount = async (data: any): Promise<any> => {
   return apiClient
      .post({
         url: CustomerApi.LockAccount,
         data,
      })
      .then((res: any) => {
         if (res?.status === 201 || res?.status === 200) {
            return res;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const unlockAccount = async (data: any): Promise<any> => {
   return apiClient
      .post({
         url: CustomerApi.UnlockAccount,
         data,
      })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const countCustomer = (): Promise<any> => {
   return apiClient.get({ url: CustomerApi.CountCustomer }).then((res: any) => {
      return res;
   });
};

export default {
   getCustomers,
   lockAccount,
   unlockAccount,
   countCustomer,
};
