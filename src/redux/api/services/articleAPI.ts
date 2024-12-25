import apiClient from '../apiClient';

export enum ArticleApi {
   GetArticles = 'private/employee/article/getalladmin',
   GetArticleTypes = 'private/employee/article/getArticleType',
   CreateArticle = 'private/employee/article/create',
   UpdateArticle = 'private/employee/article/update',
   DeleteArticle = 'private/employee/article/delete',
}

const getArticles = (): Promise<any> => {
   return apiClient
      .get({ url: ArticleApi.GetArticles })
      .then((res: any) => {
         if (res) {
            return res?.metadata?.articles;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const getArticleTypes = (): Promise<any> => {
   return apiClient
      .get({ url: ArticleApi.GetArticleTypes })
      .then((res: any) => {
         if (res) {
            return res?.metadata?.articleTypes;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const createArticle = (data: any): Promise<any> => {
   return apiClient.post({ url: ArticleApi.CreateArticle, data });
};

const updateArticle = (data: any): Promise<any> => {
   return apiClient.put({ url: ArticleApi.UpdateArticle, data });
};

const deleteArticle = (articleId: string): Promise<any> => {
   return apiClient.delete({ url: `${ArticleApi.DeleteArticle}/${articleId}` });
};

export default {
   getArticles,
   getArticleTypes,
   createArticle,
   updateArticle,
   deleteArticle,
};
