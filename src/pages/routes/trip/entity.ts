export interface Trip {
   trip_id: number | undefined;
   trip_arrival_time: string;
   trip_departure_time: string;
   trip_date: string ;
   trip_price: number;
   trip_discount: number;
   trip_shuttle_enable: number;
   allow_online_booking: number;
   trip_holiday: number;
   route: {
      route_id: number | undefined;
      route_name: string;
      route_price: number;
   };
   vehicle: {
      vehicle_id: number | undefined;
      vehicle_license_plate: string;
      vehicle_code: string;
   };
}
