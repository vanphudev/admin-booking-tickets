import apiClient from '../apiClient';

export enum VoucherApi {
   GetVouchers = 'private/employee/vouchers/getall',
   CreateVoucher = 'private/employee/vouchers/create',
   UpdateVoucher = 'private/employee/vouchers/update',
   DeleteVoucher = 'private/employee/vouchers/delete',
}

const getAllVouchers = async (): Promise<any> => {
   return apiClient.get({ url: VoucherApi.GetVouchers }).then((res: any) => {
      if (res && res?.metadata) {
         return res?.metadata?.vouchers;
      }
      return null;
      })
      .catch((error) => {
         return error;
      });
};

const createVoucher = async (data: any): Promise<any> => {
   return apiClient.post({ url: VoucherApi.CreateVoucher, data }).then((res: any) => {
      return res;
   });
};

const updateVoucher = async (data: any): Promise<any> => {
   return apiClient.put({ url: VoucherApi.UpdateVoucher, data }).then((res: any) => {
      return res;
   });
};

const deleteVoucher = async (data: any): Promise<any> => {
   return apiClient.delete({ url: VoucherApi.DeleteVoucher + '/' + data.voucher_code }).then((res: any) => {
      return res;
   });
};

export default {
   getAllVouchers,
   createVoucher,
   updateVoucher,
   deleteVoucher,
};

