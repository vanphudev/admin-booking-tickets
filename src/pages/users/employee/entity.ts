export interface Employee {
   employee_id?: number;
   employee_full_name?: string;
   employee_email?: string;
   employee_phone?: string;
   employee_username?: string;
   employee_birthday?: string;
   employee_password?: string;
   employee_profile_image?: string;
   employee_gender?: string;
   is_first_activation?: number;
   is_locked?: number;
   last_lock_at?: string;
   office?: {
      office_id?: number;
      office_name?: string;
      office_address?: string;
      office_phone?: string;
   };
   employee_type?: {
      employee_type_id?: number;
      employee_type_name?: string;
   };
   driver?: {
      driver_id: number;
      driver_license_number: string;
      driver_experience_years: number;
   };
}
