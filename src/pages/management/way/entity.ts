export interface Way {
   way_id: number;
   way_name: string;
   way_description: string;
   list_pickup_point: PickupPoint[];
}

export interface PickupPoint {
         way_id: number;
      way_name: string;
   way_description: string;
   office_id: number;   
      office_name: string;
   pickup_point_name: string;
   pickup_point_time: string;
   pickup_point_kind: number;
   pickup_point_description: string;
   point_kind_name: string;
}

