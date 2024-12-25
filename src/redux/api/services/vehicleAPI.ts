import apiClient from '../apiClient';
import { Vehicle } from '@/pages/management/vehicle/entity';

export enum VehicleApi {
   GetVehicles = 'public/vehicle/getall',
   CreateVehicle = 'private/employee/vehicle/create',
   UpdateVehicle = 'private/employee/vehicle/update',
   DeleteVehicle = 'private/employee/vehicle/delete',
   GetVehicleType = 'private/employee/vehicle/getVehicleType',
   GetLayoutVehicle = 'private/employee/vehicle/getLayoutVehicle',
}

const getVehicles = (): Promise<any> => {
   return apiClient
      .get({ url: VehicleApi.GetVehicles })
      .then((res: any) => {
         if (res && res?.metadata) {
            return res?.metadata?.vehicles;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getVehicles', error);
         return error;
      });
};

const getVehicleType = (): Promise<any> => {
   return apiClient.get({ url: VehicleApi.GetVehicleType }).then((res: any) => res?.metadata?.vehicleTypes);
};

const getLayoutVehicle = (): Promise<any> => {
   return apiClient.get({ url: VehicleApi.GetLayoutVehicle }).then((res: any) => res?.metadata?.mapVehicleLayouts);
};

const createVehicle = (data: Vehicle): Promise<any> => {
   return apiClient.post({ url: VehicleApi.CreateVehicle, data });
};

const updateVehicle = (data: Vehicle): Promise<any> => {
   return apiClient.put({ url: VehicleApi.UpdateVehicle, data });
};

const deleteVehicle = (id: string): Promise<any> => {
   return apiClient.delete({ url: `${VehicleApi.DeleteVehicle}/${id}` });
};

export default {
   getVehicles,
   getVehicleType,
   getLayoutVehicle,
   createVehicle,
   updateVehicle,
   deleteVehicle,
};
