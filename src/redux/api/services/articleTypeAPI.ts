import { ArticleType } from '@/pages/management/articleType/entity';
import apiClient from '../apiClient';

export enum ArticleTypeApi {
   GetArticleTypes = 'private/type-article/getall',
   CreateArticleType = 'private/type-article/create',
   UpdateArticleType = 'private/type-article/update',
   DeleteArticleType = 'private/type-article/delete',
}

const getArticleTypes = (): Promise<any> => {
   return apiClient
      .get({ url: ArticleTypeApi.GetArticleTypes })
      .then((res: any) => {
         if (res) {
            return res.data?.metadata?.articleTypes;
         }
         return [];
      })
      .catch((error) => {
         console.error('Lỗi getArticleTypes:', error);
         throw error;
      });
};

const createArticleType = (data: Partial<ArticleType>): Promise<any> => {
   return apiClient
      .post({ 
         url: ArticleTypeApi.CreateArticleType, 
         data 
      })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            return res.data?.metadata?.articleType;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi createArticleType:', error);
         throw error;
      });
};

const updateArticleType = (data: Partial<ArticleType>): Promise<any> => {
   return apiClient
      .put({ 
         url: `${ArticleTypeApi.UpdateArticleType}/${data.article_type_id}`,
         data 
      })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            return res.data?.metadata?.articleType;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi updateArticleType:', error);
         throw error;
      });
};

const deleteArticleType = (id: number): Promise<any> => {
   return apiClient
      .delete({ 
         url: `${ArticleTypeApi.DeleteArticleType}/${id}` 
      })
      .then((res: any) => {
         return res.data;
      })
      .catch((error) => {
         console.error('Lỗi deleteArticleType:', error);
         throw error;
      });
};

export default {
   getArticleTypes,
   createArticleType,
   updateArticleType,
   deleteArticleType,
};