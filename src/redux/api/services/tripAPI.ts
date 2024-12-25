import apiClient from '../apiClient';
import dayjs from 'dayjs';

export enum TripApi {
   GetTrips = 'private/employee/trips/get-all-trips',
   CreateTrip = 'private/employee/trips/create-trip',
   UpdateTrip = 'private/employee/trips/update-trip',
   DeleteTrip = 'private/employee/trips/delete-trip',
   UpdateTripAdvanced = 'private/employee/trips/update-ticket-price-advance',
   CountTrip = 'private/employee/trips/count',
}

const getTrips = (params: any): Promise<any> => {
   const formattedParams: any = {
      dateType: params.dateType,
      startTime: params.startTime ? dayjs(params.startTime).toISOString() : undefined,
      endTime: params.endTime ? dayjs(params.endTime).toISOString() : undefined,
      routeId: params.routeId,
      specificDate: params.specificDate ? dayjs(params.specificDate).toISOString() : undefined,
      today: params.dateType === 'today' ? dayjs().toISOString() : undefined,
   };

   if (params.dateRange && params.dateRange.length === 2) {
      formattedParams.dateRangeS = dayjs(params.dateRange[0]).toISOString();
      formattedParams.dateRangeE = dayjs(params.dateRange[1]).toISOString();
   }

   const filteredParams = Object.fromEntries(
      Object.entries(formattedParams).filter(([_, value]) => value !== undefined),
   );

   const queryParams = Object.entries(filteredParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

   console.log('queryParams', queryParams);
   return apiClient
      .get({ url: `${TripApi.GetTrips}?${queryParams}` })
      .then((res: any) => {
         if (res) {
            return res?.metadata?.trips;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getOffices', error);
         return error;
      });
};

const createTrip = (data: any): Promise<any> => {
   return apiClient.post({ url: TripApi.CreateTrip, data });
};

const updateTrip = (data: any): Promise<any> => {
   return apiClient.put({ url: TripApi.UpdateTrip, data });
};

const deleteTrip = (id: any): Promise<any> => {
   return apiClient.delete({ url: `${TripApi.DeleteTrip}/${id}` });
};

const updateTripAdvanced = (data: any): Promise<any> => {
   return apiClient.put({ url: TripApi.UpdateTripAdvanced, data });
};

const countTrip = (): Promise<any> => {
   return apiClient.get({ url: TripApi.CountTrip });
};

export default {
   getTrips,
   createTrip,
   updateTrip,
   deleteTrip,
   updateTripAdvanced,
   countTrip,
};
