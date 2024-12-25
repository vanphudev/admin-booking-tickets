export interface Office {
  office_id: number;
  office_name: string;
}

export interface Way {
  way_id: number;
  way_name: string; 
  way_description: string;
  origin_office: Office;
  destination_office: Office;
}

export interface Route {
  route_id: number;
  route_name: string;
  route_duration: number;
  route_distance: number;
  route_url_gps: string;
  origin_office_id: number;
  destination_office_id: number;
  route_price: number;
  is_default: number;
  is_locked: number;
  last_lock_at: string;
  way: Way;
}

export const DEFAULT_OFFICE: Office = {
  office_id: 0,
  office_name: ''
};

export const DEFAULT_WAY: Way = {
  way_id: 0,
  way_name: '',
  way_description: '',
  origin_office: DEFAULT_OFFICE,
  destination_office: DEFAULT_OFFICE
};

export const DEFAULT_ROUTE: Route = {
  route_id: 0,
  route_name: '',
  route_duration: 0,
  route_distance: 0,
  route_url_gps: '',
  origin_office_id: 0,
  destination_office_id: 0,
  route_price: 0,
  is_default: 0,
  is_locked: 0,
  last_lock_at: '',
  way: DEFAULT_WAY
};
