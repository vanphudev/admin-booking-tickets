import apiClient from '../apiClient';

export enum ReportApi {
   GetBookingStatusStatsByMonth = 'private/employee/report/get-booking-status-stats-by-month',
   GetReportByTrip = 'private/employee/report/get-report-by-trip',
}

const getBookingStatusStatsByMonth = async (): Promise<any> => {
   return apiClient.get({ url: ReportApi.GetBookingStatusStatsByMonth }).then((res: any) => {
      if (res && (res?.status === 200 || res?.status === 201)) {
         return res?.metadata?.data;
      }
      return null;
   });
};

const getReportByTrip = async (data: any): Promise<any> => {
   return apiClient.post({ url: ReportApi.GetReportByTrip, data }).then((res: any) => {
      if (res && (res?.status === 200 || res?.status === 201)) {
         return res?.metadata?.data;
      }
      return null;
   });
};

export default {
   getBookingStatusStatsByMonth,
   getReportByTrip,
};
