import apiClient from '../apiClient';

export enum AddressApi {
   GetProvinces = 'public/provinces/getall',
   GetDistrictsAll = 'public/districts/getall',
   GetWardsAll = 'public/wards/getall',
   GetWardsByDistrictId = 'public/wards/getbydistrictid/',
   GetDistrictsByProvinceId = 'public/districts/getbyprovinceid/',
}

const getProvinces = (): Promise<any> => {
   return apiClient
      .get({ url: AddressApi.GetProvinces })
      .then((res: any) => {
         if (res) {
            return res?.metadata?.provinces;
         }
         return null;
      })
      .catch((error) => {
         return error;
      });
};

const getDistricts = (provinceId: string): Promise<any> => {
   return apiClient.get({ url: AddressApi.GetDistrictsByProvinceId + provinceId }).then((res: any) => {
      if (res) {
         return res?.metadata?.districts;
      }
      return null;
   });
};

const getWards = (districtId: string): Promise<any> => {
   return apiClient.get({ url: AddressApi.GetWardsByDistrictId + districtId }).then((res: any) => {
      if (res) {
         return res?.metadata?.wards;
      }
      return null;
   });
};

const getDistrictsAll = (): Promise<any> => {
   return apiClient.get({ url: AddressApi.GetDistrictsAll }).then((res: any) => {
      if (res) {
         return res?.metadata?.districts;
      }
      return null;
   });
};

const getWardsAll = (): Promise<any> => {
   return apiClient.get({ url: AddressApi.GetWardsAll }).then((res: any) => {
      if (res) {
         return res?.metadata?.wards;
      }
      return null;
   });
};

export default {
   getProvinces,
   getDistricts,
   getWards,
   getDistrictsAll,
   getWardsAll,
};
