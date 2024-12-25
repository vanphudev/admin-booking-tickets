export interface Voucher {
   voucher_id: number;
   voucher_code: string;
   voucher_discount_percentage: number;
   voucher_discount_max_amount: number;
   voucher_usage_limit: number;
   voucher_valid_from: string;
   voucher_valid_to: string;
   voucher_created_by: {
      employee_id: number;
      employee_full_name: string;
      employee_email: string;
      employee_phone?: string;
   };
}
