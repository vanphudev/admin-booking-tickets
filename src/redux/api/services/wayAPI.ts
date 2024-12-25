import apiClient from '../apiClient';

export enum WayApi {
   GetWays = 'public/way/getall',
   CreateWay = 'private/employee/way/create',
   UpdateWay = 'private/employee/way/update',
   DeleteWay = 'private/employee/way/delete',
}

const getWays = async (): Promise<any> => {
   return apiClient
      .get({ url: WayApi.GetWays })
      .then((res: any) => {
         if (res && res?.metadata) {
            return res?.metadata?.ways;
         }
         return null;
      })
      .catch((error) => {
         return error;
      });
};

const createWay = async (payload: any): Promise<any> => {
   return apiClient
      .post({ url: WayApi.CreateWay, data: payload })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            return res?.metadata?.way;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const updateWay = async (payload: any): Promise<any> => {
   return apiClient
      .put({ url: WayApi.UpdateWay, data: payload })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            return res?.metadata?.way;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const deleteWay = async (way_id: number): Promise<any> => {
   return apiClient
      .delete({ url: `${WayApi.DeleteWay}?wayId=${way_id}` })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            return res?.metadata?.way;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   getWays,
   createWay,
   updateWay,
   deleteWay,
};
