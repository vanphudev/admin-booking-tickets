import apiClient from '../apiClient';

export enum PaymentMethodApi {
   GetPaymentMethods = 'private/employee/payment/get-all-payment-method',
   CountBooking = 'public/booking/count',
}
const getPaymentMethods = (): Promise<any> => {
   return apiClient
      .get({ url: PaymentMethodApi.GetPaymentMethods })
      .then((res: any) => {
         if (res && (res.status === 200 || res.status === 201)) {
            return res?.metadata?.payments;
         }
      })
      .catch((error) => {
         return error;
      });
};

const countBooking = (): Promise<any> => {
   return apiClient.get({ url: PaymentMethodApi.CountBooking }).then((res: any) => {
      return res;
   });
};

export default {
   getPaymentMethods,
   countBooking,
};
