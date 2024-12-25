export interface Employee {
   employee_id: number;
   employee_full_name: string;
   employee_phone: string;
   employee_email: string;
}

export interface Customer {
   customer_id: number;
   customer_full_name: string;
   customer_phone: string;
   customer_email: string;
}

export interface Ticket {
   ticket_id: number;
   booking_seat_id: number;
   ticket_name_chair: string;
   ticket_amount: number;
   ticket_code: string;
}

export interface Booking {
   booking_code: string;
   booking_total_payment: number;
   booking_status: number;
   payment_status: string;
}

export interface Refund {
   refund_id: number;   
   refund_code: string;
   ticket_id: Ticket;
   refund_amount: number;
   refund_description: string;
   refund_percentage: number;
   employee_id: Employee;
   refunded_at: string;
   is_refunded: number;
   refund_method: string;
   is_approved: number;
   customer_id: Customer;
   booking_id: Booking;
}
