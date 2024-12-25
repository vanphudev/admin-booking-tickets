import apiClient from '../apiClient';

export enum EmployeeTypeApi {
   GetAll = '/public/employee-type/getall',
   Create = '/private/employee-type/create',
   Update = '/private/employee-type/update',
   Delete = '/private/employee-type/delete',
}

const getEmployeeTypes = async (): Promise<any> => {
   return apiClient
      .get({ url: EmployeeTypeApi.GetAll })
      .then((response: any) => {
         if (response?.metadata?.employeeTypes) {
            return response?.metadata?.employeeTypes;
         }
         return null;
      })
      .catch((error: any) => {
         return error;
      });
};

const createEmployeeType = async (data: any): Promise<any> => {
   return apiClient
      .post({
         url: EmployeeTypeApi.Create,
         data,
      })
      .then((response: any) => {
         if (response && response.status === 200) {
            return response?.metadata?.employeeType;
         }
         return null;
      })
      .catch((error: any) => {
         return error;
      });
};

const updateEmployeeType = async (data: Partial<any> & { employee_type_id: number }): Promise<any> => {
   return apiClient
      .put({
         url: `${EmployeeTypeApi.Update}/${data.employee_type_id}`,
         data,
      })
      .then((response: any) => {
         if (response && response.status === 200) {
            return response?.metadata?.employeeType;
         }
         return null;
      })
      .catch((error: any) => {
         return error;
      });
};

const deleteEmployeeType = async (employee_type_id: number) => {
   return apiClient
      .delete({
         url: `${EmployeeTypeApi.Delete}/${employee_type_id}`,
      })
      .then((response: any) => {
         if (response && response.status === 200) {
            return response?.metadata?.employeeType;
         }
         return null;
      })
      .catch((error: any) => {
         return error;
      });
};

export default {
   getEmployeeTypes,
   createEmployeeType,
   updateEmployeeType,
   deleteEmployeeType,
};
