export interface Review {
   review_id: number;
   review_rating: number;
   review_date: string;
   review_comment: string;
   is_locked: number;
   last_lock_at: string;
   route_id: number;
   customer: {
      customer_id: number;
      customer_full_name: string;
      customer_phone: string;
      customer_email: string;
   };
   trip: {
      trip_id: number;
      trip_date: string;
      route_name: string;
   };
   booking: {
      booking_id: number;
      booking_code: string;
      created_at: string;
   };
}
