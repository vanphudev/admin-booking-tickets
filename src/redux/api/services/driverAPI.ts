// import apiClient from '../apiClient';
// import { Driver } from '@/pages/management/way/entity';

// export enum DriverApi {
//    GetDrivers = 'public/driver/getall',
//    CreateDriver = 'private/driver/create',
//    UpdateDriver = 'private/driver/update',
//    DeleteDriver = 'private/driver/delete',
//    UploadImage = 'private/driverimage/create',
//    UpdateImage = 'private/driverimage/update',
// }

// const getDrivers = (): Promise<any> => {
//    return apiClient
//       .get({ url: DriverApi.GetDrivers })
//       .then((res: any) => {
//          if (res) {
//             return res.data?.metadata?.drivers.map((driver: any) => ({
//                driver_id: driver.driver_id,
//                driver_license_number: driver.driver_license_number,
//                driver_experience_years: driver.driver_experience_years,
//                createdAt: driver.created_at,
//                updatedAt: driver.updated_at,
//                driver_onetoOne_employee: driver.driver_onetoOne_employee,
//             }));
//          }
//          return null;
//       })
//       .catch((error) => {
//          console.log('Lỗi getDrivers', error);
//          return error;
//       });
// };

// const createDriver = async (data: Driver): Promise<any> => {
//    try {
//       const res = (await apiClient.post({
//          url: DriverApi.CreateDriver,
//          data,
//       })) as any;
//       if (!res || !res.data) {
//          console.error('Response from CreateOffice API is missing or invalid', res);
//          console.log('Data to create/update vehicle:', data);
//          return res;
//       }
//       const { metadata } = res.data;
//       if (!metadata || !metadata.driver) {
//          console.warn('Metadata or driver information is missing in response', res.data);
//          return res;
//       }
//       const { driver_id: id, driver_license_number: driverNumber } = metadata.driver;
//       if (!id || !driverNumber) {
//          console.warn('Missing driver ID or driver number in response', metadata.driver);
//          return res;
//       }
//       if (data.images && data.images.length > 0) {
//          const formData = new FormData();
//          data.images.forEach((file) => formData.append('images', file));
//          try {
//             const uploadRes = await apiClient.post({
//                url: DriverApi.UploadImage,
//                data: formData,
//                headers: {
//                   'Content-Type': 'multipart/form-data',
//                   officeId: id.toString(),
//                   officeName: encodeURIComponent(driverNumber),
//                },
//             });
//             return { ...res, imageUpload: uploadRes };
//          } catch (uploadError) {
//             console.error('Error uploading images', uploadError);
//             throw new Error('Failed to upload images');
//          }
//       }

//       return res;
//    } catch (error) {
//       console.error('Error creating office', error);
// import { Driver } from '@/pages/management/driver/entity';
// import apiClient from '../apiClient';

// export enum DriverApi {
//    GetDrivers = '/public/driver/all',
//    CreateDriver = '/private/driver/create',
//    UpdateDriver = '/private/driver/update',
//    DeleteDriver = '/private/driver/delete',
// }

// interface ApiResponse {
//    success: boolean;
//    message?: string;
//    metadata?: {
//       drivers?: Driver[];
//       driver?: Driver;
//    };
// }

// const getDrivers = async () => {
//    try {
//       const response = (await apiClient.get({ url: DriverApi.GetDrivers })) as { data: ApiResponse };
//       return response.data?.metadata?.drivers || [];
//    } catch (error) {
//       console.error('Lỗi getDrivers:', error);
//       throw error;
//    }
// };

// const createDriver = async (data: Partial<Driver>) => {
//    try {
//       const response = (await apiClient.post({
//          url: DriverApi.CreateDriver,
//          data,
//       })) as { data: ApiResponse };
//       return {
//          success: response.data?.success || false,
//          data: response.data?.metadata?.driver,
//          message: response.data?.message,
//       };
//    } catch (error) {
//       console.error('Lỗi createDriver:', error);
//       throw error;
//    }
// };

// const updateDriver = async (data: Driver): Promise<any> => {
//    try {
//       const res = (await apiClient.put({ url: DriverApi.UpdateDriver, data })) as any;
//       if (!res || !res.data) {
//          console.error('Response from Update Driver API is missing or invalid', res);
//          return res;
//       }
//       const { metadata } = res.data;
//       if (!metadata || !metadata.driver) {
//          console.warn('Metadata or driver information is missing in response', res.data);
//          return res;
//       }
//       const { driver_id: id, driver_license_number: driverName } = metadata.driver;
//       if (!id || !driverName) {
//          console.warn('Missing driver ID or office name in response', metadata.driver);
//          return res;
//       }
//       const formData = new FormData();
//       (data.images == null || data.images.length === 0) && formData.append('images', '');
//       data.images && data.images.forEach((file) => formData.append('images', file));
//       try {
//          const uploadRes = await apiClient.put({
//             url: DriverApi.UpdateImage,
//             data: formData,
//             headers: {
//                'Content-Type': 'multipart/form-data',
//                driverId: id.toString(),
//                driverName: encodeURIComponent(driverName),
//             },
//          });
//          return { ...res, imageUpload: uploadRes };
//       } catch (uploadError) {
//          console.error('Error uploading images', uploadError);
//          throw new Error('Failed to upload images');
//       }
//       return res;
//    } catch (error) {
//       console.error('Error updating office', error);
// const updateDriver = async (data: Partial<Driver>) => {
//    try {
//       const response = (await apiClient.put({
//          url: `${DriverApi.UpdateDriver}/${data.driver_id}`,
//          data,
//       })) as { data: ApiResponse };
//       return {
//          success: response.data?.success || false,
//          data: response.data?.metadata?.driver,
//          message: response.data?.message,
//       };
//    } catch (error) {
//       console.error('Lỗi updateDriver:', error);
//       throw error;
//    }
// };

// const deleteDriver = (id: string): Promise<any> => {
//    return apiClient
//       .delete({ url: `${DriverApi.DeleteDriver}/${id}` })
//       .then((res: any) => {
//          return res;
//       })
//       .catch((error) => {
//          return error;
//       });
// };

// const uploadImage = (id: string, file: File): Promise<any> => {
//    const formData = new FormData();
//    formData.append('images', file);
//    return apiClient
//       .post({
//          url: `${DriverApi.UploadImage}${id}`,
//          data: formData,
//          headers: { 'Content-Type': 'multipart/form-data' },
//       })
//       .then((res: any) => {
//          return res;
//       })
//       .catch((error) => {
//          return error;
//       });
// const deleteDriver = async (driver_id: number) => {
//    try {
//       const response = (await apiClient.delete({
//          url: `${DriverApi.DeleteDriver}/${driver_id}`,
//       })) as { data: ApiResponse };
//       return {
//          success: response.data?.success || false,
//          message: response.data?.message,
//       };
//    } catch (error) {
//       console.error('Lỗi deleteDriver:', error);
//       throw error;
//    }
// };

// export default {
//    getDrivers,
//    createDriver,
//    updateDriver,
//    deleteDriver,
//    uploadImage,
// };
