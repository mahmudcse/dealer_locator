export interface Dealer {
  _id?: string;
  name: string;
  manufacturer: "KIA" | "Seat" | "Opel" | "Other";
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface DealerResponse {
  success: boolean;
  count?: number;
  data: Dealer | Dealer[];
  message?: string;
}

export interface SearchParams {
  postalCode?: string;
  place?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  manufacturer?: "KIA" | "Seat" | "Opel" | "Other";
}
