import axios from "axios";
import type { Dealer, DealerResponse, SearchParams } from "@/types/dealer";

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Dealers API
export const dealerService = {
  // Get all dealers
  getAllDealers: async (): Promise<Dealer[]> => {
    const response = await api.get<DealerResponse>("/dealers");
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Get dealer by ID
  getDealerById: async (id: string): Promise<Dealer> => {
    const response = await api.get<DealerResponse>(`/dealers/${id}`);
    return response.data.data as Dealer;
  },

  // Create dealer
  createDealer: async (dealer: Dealer): Promise<Dealer> => {
    const response = await api.post<DealerResponse>("/dealers", dealer);
    return response.data.data as Dealer;
  },

  // Update dealer
  updateDealer: async (
    id: string,
    dealer: Partial<Dealer>
  ): Promise<Dealer> => {
    const response = await api.put<DealerResponse>(`/dealers/${id}`, dealer);
    return response.data.data as Dealer;
  },

  // Delete dealer
  deleteDealer: async (id: string): Promise<void> => {
    await api.delete(`/dealers/${id}`);
  },

  // Search by postal code
  searchByPostalCode: async (postalCode: string): Promise<Dealer[]> => {
    const response = await api.get<DealerResponse>(
      "/dealers/search/postal-code",
      {
        params: { postalCode },
      }
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Search by place
  searchByPlace: async (place: string): Promise<Dealer[]> => {
    const response = await api.get<DealerResponse>("/dealers/search/place", {
      params: { place },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Search by radius
  searchByRadius: async (
    lat: number,
    lng: number,
    radius: number = 10
  ): Promise<Dealer[]> => {
    const response = await api.get<DealerResponse>("/dealers/search/radius", {
      params: { lat, lng, radius },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Filter by manufacturer
  filterByManufacturer: async (
    manufacturer: "KIA" | "Seat" | "Opel" | "Other"
  ): Promise<Dealer[]> => {
    const response = await api.get<DealerResponse>(
      "/dealers/filter/manufacturer",
      {
        params: { manufacturer },
      }
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Export to CSV
  exportToCSV: async (params?: SearchParams): Promise<Blob> => {
    const response = await api.get("/dealers/export/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  // Export to Excel
  exportToExcel: async (params?: SearchParams): Promise<Blob> => {
    const response = await api.get("/dealers/export/excel", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};

// Health check
export const healthService = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

// Scraping service
export const scrapingService = {
  // Scrape dealers from manufacturer websites (preview - doesn't save)
  scrapePreview: async (
    postalCode: string,
    manufacturer: "KIA" | "Seat" | "Opel" | "All" = "All"
  ): Promise<Dealer[]> => {
    const response = await api.get<DealerResponse>("/dealers/scrape/preview", {
      params: { postalCode, manufacturer },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Scrape dealers and save to database
  scrapeAndSave: async (
    postalCode: string,
    manufacturer: "KIA" | "Seat" | "Opel" | "All" = "All"
  ): Promise<Dealer[]> => {
    const response = await api.get<DealerResponse>("/dealers/scrape", {
      params: { postalCode, manufacturer },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};

export default api;
