import apiClient from '../apiClient';

export enum RefundApi {
   GetRefund = 'private/employee/refund/refund-all',
   RefundToday = 'private/employee/refund/refund-today',
   RefundNoApproved = 'private/employee/refund/refund-no-approved',
   ApproveRefund = 'private/employee/refund/approve-refund',
}

const getRefund = async (): Promise<any> => {
   return apiClient
      .get({ url: RefundApi.GetRefund })
      .then((res: any) => {
         if (res && res?.metadata) {
            return res?.metadata?.refunds;
         }
         return null;
      })
      .catch((error) => {
         return null;
      });
};

const refundToday = async (): Promise<any> => {
   return apiClient
      .get({ url: RefundApi.RefundToday })
      .then((res: any) => {
         if (res && res?.metadata) {
            return res?.metadata?.refunds;
         }
         return null;
      })
      .catch((error) => {
         return null;
      });
};

const refundNoApproved = async (): Promise<any> => {
   return apiClient
      .get({ url: RefundApi.RefundNoApproved })
      .then((res: any) => {
         if (res && res?.metadata) {
            return res?.metadata?.refunds;
         }
         return null;
      })
      .catch((error) => {
         return null;
      });
};

const approveRefund = async (data: any): Promise<any> => {
   return apiClient.post({ url: RefundApi.ApproveRefund, data }).then((res: any) => {
      if (res && (res?.status === 200 || res?.status === 201)) {
         return res;
      }
      return res;
   });
};

export default {
   getRefund,
   refundToday,
   refundNoApproved,
   approveRefund,
};
