import { Employee } from '@/pages/users/employee/entity';
import apiClient from '@/redux/api/apiClient';

export enum EmployeeApi {
   GetEmployees = '/private/employee/employee/auth/getall',
   CreateEmployee = '/private/employee/employee/auth/create',
   UpdateEmployee = '/private/employee/employee/auth/update',
   DeleteEmployee = '/private/employee/employee/auth/delete',
   ResetPassword = '/private/employee/employee/auth/resetpassword',
   ChangePassword = '/private/employee/employee/auth/update-password',
   UpdateProfile = '/private/employee/employee/auth/update-info',
   CountEmployee = '/private/employee/employee/auth/count',
}

const getEmployees = (): Promise<any> => {
   return apiClient
      .get({ url: EmployeeApi.GetEmployees })
      .then((res: any) => {
         if (res?.metadata?.employees) {
            return res?.metadata?.employees;
         }
         return null;
      })
      .catch((error) => {
         return error;
      });
};

const createEmployee = (data: any): Promise<any> => {
   return apiClient
      .post({
         url: EmployeeApi.CreateEmployee,
         data,
      })
      .then((res: any) => {
         if ((res?.status === 201 || res?.status === 200) && res?.metadata?.employee) {
            return res?.metadata?.employee;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const updateEmployee = (data: Partial<Employee>): Promise<any> => {
   return apiClient
      .put({
         url: EmployeeApi.UpdateEmployee,
         data,
      })
      .then((res: any) => {
         if ((res?.status === 201 || res?.status === 200) && res?.metadata?.employee) {
            return res?.metadata.employee;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const deleteEmployee = (employee_id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${EmployeeApi.DeleteEmployee}/${employee_id}` })
      .then((res: any) => {
         if (res?.status === 200 || res?.status === 201) {
            return res;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const resetPassword = (employee_id: number): Promise<any> => {
   return apiClient
      .post({ url: EmployeeApi.ResetPassword, data: { employee_id } })
      .then((res: any) => {
         if (res?.status === 200 || res?.status === 201) {
            return res;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const changePassword = (data: any): Promise<any> => {
   return apiClient.put({ url: EmployeeApi.ChangePassword, data }).then((res: any) => {
      if (res?.status === 200 || res?.status === 201) {
         return res;
      }
      return res;
   });
};

const updateProfile = (data: any): Promise<any> => {
   return apiClient.put({ url: EmployeeApi.UpdateProfile, data }).then((res: any) => {
      if (res?.status === 200 || res?.status === 201) {
         return res;
      }
      return res;
   });
};

const countEmployee = (): Promise<any> => {
   return apiClient.get({ url: EmployeeApi.CountEmployee }).then((res: any) => {
      if (res?.status === 200 || res?.status === 201) {
         return res;
      }
      return res;
   });
};

export default {
   getEmployees,
   createEmployee,
   updateEmployee,
   deleteEmployee,
   resetPassword,
   changePassword,
   updateProfile,
   countEmployee,
};
