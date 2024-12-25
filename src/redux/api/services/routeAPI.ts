import apiClient from '../apiClient';

export enum RouteApi {
   GetRoutes = 'private/employee/route/get-all-routes-admin',
   CreateRoute = 'private/employee/route/create-route',
   UpdateRoute = 'private/employee/route/update-route',
   DeleteRoute = 'private/employee/route/delete-route',
}

const getRoutes = (): Promise<any> => {
   return apiClient
      .get({ url: RouteApi.GetRoutes })
      .then((res: any) => {
         if (res) {
            return res?.metadata?.routes;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getOffices', error);
         return error;
      });
};

const createRoute = (data: any): Promise<any> => {
   return apiClient.post({ url: RouteApi.CreateRoute, data });
};

const updateRoute = (data: any): Promise<any> => {
   return apiClient.put({ url: RouteApi.UpdateRoute, data });
};

const deleteRoute = (id: any): Promise<any> => {
   return apiClient.delete({ url: `${RouteApi.DeleteRoute}/${id}` });
};

export default {
   getRoutes,
   createRoute,
   updateRoute,
   deleteRoute,
};
