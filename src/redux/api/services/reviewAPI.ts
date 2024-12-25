import { Review } from '@/pages/management/review/entity';

import apiClient from '../apiClient';

export enum ReviewApi {
   GetReviews = 'public/review/getall',
   CreateReviews = 'private/review/create',
   UpdateReviews = 'private/review/update',
   DeleteReview = 'private/review/delete',
   // UploadImage = 'private/reviewimage/create',
   // UpdateImage = 'private/reviewimage/update',
   UploadImage = 'private/reviewimage/create',
   UpdateImage = 'private/reviewimage/update',
}

const getReviews = (): Promise<any> => {
   return apiClient
      .get({ url: ReviewApi.GetReviews })
      .then((res: any) => {
         if (res) {
            return res.data?.metadata?.reviews;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getOffices', error);
         return error;
      });
};
const deleteReview = (review_image_id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${ReviewApi.DeleteReview}/${review_image_id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};
const createReview = async (data: Review): Promise<any> => {
   try {
      const res = (await apiClient.post({
         url: ReviewApi.CreateReviews,
         data,
      })) as any;
      if (!res || !res.data) {
         console.error('Response from CreateOffice API is missing or invalid', res);
         return res;
      }
      const { metadata } = res.data;
      if (!metadata || !metadata.office) {
         console.warn('Metadata or office information is missing in response', res.data);
         return res;
      }
      const { office_id: id, office_name: officeName } = metadata.office;
      if (!id || !officeName) {
         console.warn('Missing office ID or office name in response', metadata.office);
         return res;
      }

      return res;
   } catch (error) {
      console.error('Error creating office', error);
      throw error;
   }
};

const updateReview = async (data: Review): Promise<any> => {
   try {
      const res = (await apiClient.put({ url: ReviewApi.UploadImage, data })) as any;
      if (!res || !res.data) {
         console.error('Response from UpdateOffice API is missing or invalid', res);
         return res;
      }
      const { metadata } = res.data;
      if (!metadata || !metadata.review) {
         console.warn('Metadata or office information is missing in response', res.data);
         return res;
      }
      const { id: review_id, rating: review_rating } = metadata.review;
      if (!review_id || !review_rating) {
         console.warn('Missing office ID or office name in response', metadata.review);
         return res;
      }
      const formData = new FormData();
      try {
         const uploadRes = await apiClient.put({
            url: ReviewApi.UpdateImage,
            data: formData,
            headers: {
               'Content-Type': 'multipart/form-data',
               review_id: review_id.toString(),
               review_rating: encodeURIComponent(review_rating),
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

const uploadImage = (review_id: string, file: File): Promise<any> => {
   const formData = new FormData();
   formData.append('images', file);
   return apiClient
      .post({
         url: `${ReviewApi.UploadImage}${review_id}`,
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
   getReviews,
   deleteReview,
   uploadImage,
   updateReview,
   createReview,
};
