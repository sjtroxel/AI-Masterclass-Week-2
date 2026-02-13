export interface Location {
  id?: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  locationable_id?: number;
  locationable_type?: string;
}
