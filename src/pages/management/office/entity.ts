export interface Office {
   id: number; // office_id
   name: string; // office_name
   phone?: string; // office_phone
   fax?: string; // office_fax
   description?: string; // office_description
   latitude?: number; // office_latitude
   longitude?: number; // office_longitude
   mapUrl?: string; // office_map_url
   isLocked?: 0 | 1; // is_locked
   lastLockAt?: string | null; // last_lock_at
   createdAt?: string; // created_at
   updatedAt?: string; // updated_at
   Address?: {
      province: string | null;
      district: string | null;
      ward: string | null;
      street: string | null;
   };
   images?: File[];
}
