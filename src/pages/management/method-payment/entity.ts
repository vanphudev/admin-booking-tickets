export interface PaymentMethod {
   payment_method_id?: number;
   payment_method_code: string;
   payment_method_name: string;
   is_locked: 0 | 1;
   last_lock_at?: string;
   payment_method_description?: string;
}
