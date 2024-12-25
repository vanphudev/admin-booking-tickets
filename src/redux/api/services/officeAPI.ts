import { Office } from '@/pages/management/office/entity';

import apiClient from '../apiClient';

export enum OfficeApi {
   GetOffices = 'public/office/getall',
   CreateOffice = 'private/employee/office/create',
   UpdateOffice = 'private/employee/office/update',
   DeleteOffice = 'private/employee/office/delete',
   UploadImage = 'private/employee/officeimage/create',
   UpdateImage = 'private/employee/officeimage/update',
}

const getOffices = (): Promise<any> => {
   return apiClient
      .get({ url: OfficeApi.GetOffices })
      .then((res: any) => {
         if (res) {
            return res?.metadata?.offices;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getOffices', error);
         return error;
      });
};

const createOffice = async (data: Office): Promise<any> => {
   try {
      const res = (await apiClient.post({
         url: OfficeApi.CreateOffice,
         data,
      })) as any;
      if (!res || !res.metadata) {
         console.error('Response from CreateOffice API is missing or invalid', res);
         console.error('Response from CreateOffice API is missing or invalid');
         return res;
      }
      const { metadata } = res;
      if (!metadata || !metadata.office) {
         console.warn('Metadata or office information is missing in response', res.data);
         return res;
      }
      const { office_id: id, office_name: officeName } = metadata.office;
      if (!id || !officeName) {
         console.warn('Missing office ID or office name in response', metadata.office);
         return res;
      }
      if (data.images && data.images.length > 0) {
         const formData = new FormData();
         data.images.forEach((file) => formData.append('images', file));
         try {
            const uploadRes = await apiClient.post({
               url: OfficeApi.UploadImage,
               data: formData,
               headers: {
                  'Content-Type': 'multipart/form-data',
                  officeId: id.toString(),
                  officeName: encodeURIComponent(officeName),
               },
            });
            return { ...res, imageUpload: uploadRes };
         } catch (uploadError) {
            console.error('Error uploading images', uploadError);
            throw new Error('Failed to upload images');
         }
      }

      return res;
   } catch (error) {
      console.error('Error creating office', error);
      throw error;
   }
};

const updateOffice = async (data: Office): Promise<any> => {
   try {
      const res = (await apiClient.put({ url: OfficeApi.UpdateOffice, data })) as any;
      if (!res || !res.metadata) {
         console.error('Response from UpdateOffice API is missing or invalid', res);
         return res;
      }
      const { metadata } = res;
      if (!metadata || !metadata.office) {
         console.warn('Metadata or office information is missing in response', res.data);
         return res;
      }
      const { office_id: id, office_name: officeName } = metadata.office;
      if (!id || !officeName) {
         console.warn('Missing office ID or office name in response', metadata.office);
         return res;
      }
      const formData = new FormData();
      (data.images == null || data.images.length === 0) && formData.append('images', '');
      data.images && data.images.forEach((file) => formData.append('images', file));
      try {
         const uploadRes = await apiClient.put({
            url: OfficeApi.UpdateImage,
            data: formData,
            headers: {
               'Content-Type': 'multipart/form-data',
               officeId: id.toString(),
               officeName: encodeURIComponent(officeName),
            },
         });
         return { ...res, imageUpload: uploadRes };
      } catch (uploadError) {
         console.error('Error uploading images', uploadError);
         throw new Error('Failed to upload images');
      }
      return res;
   } catch (error) {
      console.error('Error updating office', error);
      throw error;
   }
};

const deleteOffice = (id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${OfficeApi.DeleteOffice}/${id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const uploadImage = (id: string, file: File): Promise<any> => {
   const formData = new FormData();
   formData.append('images', file);
   return apiClient
      .post({
         url: `${OfficeApi.UploadImage}${id}`,
         data: formData,
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   getOffices,
   createOffice,
   updateOffice,
   deleteOffice,
   uploadImage,
};
