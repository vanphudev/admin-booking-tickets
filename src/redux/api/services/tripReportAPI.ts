import { Dayjs } from 'dayjs';
import apiClient from '../apiClient';

export enum TripReportApi {
   GetTripReport = 'public/trip/get-report',
}

const getTripReport = async (data: any): Promise<any> => {
   return apiClient
      .post({ url: TripReportApi.GetTripReport, data })
      .then((res: any) => {
         if (res && res?.metadata) {
            return res?.metadata?.tripReport;
         }
         return null;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   getTripReport,
};
