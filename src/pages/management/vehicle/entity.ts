export interface Vehicle {
   id?: number;
   code: string;
   license_plate: string;
   model?: string;
   brand?: string;
   capacity: number;
   manufacture_year?: number;
   color?: string;
   description?: string;
   isLocked?: 0 | 1;
   lastLockAt?: string | null;
   mapVehicleLayout?: MapVehicleLayout;
   images?: string;
   office_id?: number;
}

export interface MapVehicleSeat {
   id: number;
   code: string;
   row_no: number;
   column_no: number;
   floor_no: number;
   lock_chair: boolean;
   layout?: MapVehicleLayout;
}

export interface MapVehicleLayout {
   id: number;
   name: string;
   vehicle_type?: VehicleType;
}

export interface VehicleType {
   id: number;
   name: string;
   description?: string;
}
