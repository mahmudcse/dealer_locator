import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Dealer } from "@/types/dealer";
import { dealerService } from "@/services/api";

export const useDealerStore = defineStore("dealer", () => {
  const dealers = ref<Dealer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref("");
  const selectedManufacturer = ref<"KIA" | "Seat" | "Opel" | "Other" | "">("");

  // Computed
  const filteredDealers = computed(() => {
    let result = dealers.value;

    if (selectedManufacturer.value) {
      result = result.filter(
        (dealer) => dealer.manufacturer === selectedManufacturer.value
      );
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (dealer) =>
          dealer.name.toLowerCase().includes(query) ||
          dealer.address.city.toLowerCase().includes(query) ||
          dealer.address.postalCode.includes(query)
      );
    }

    return result;
  });

  // Actions
  const fetchDealers = async () => {
    loading.value = true;
    error.value = null;
    try {
      dealers.value = await dealerService.getAllDealers();
    } catch (err: any) {
      error.value = err.message || "Failed to fetch dealers";
      console.error("Error fetching dealers:", err);
    } finally {
      loading.value = false;
    }
  };

  const searchByPostalCode = async (postalCode: string) => {
    loading.value = true;
    error.value = null;
    try {
      dealers.value = await dealerService.searchByPostalCode(postalCode);
    } catch (err: any) {
      error.value = err.message || "Failed to search dealers";
      console.error("Error searching dealers:", err);
    } finally {
      loading.value = false;
    }
  };

  const searchByPlace = async (place: string) => {
    loading.value = true;
    error.value = null;
    try {
      dealers.value = await dealerService.searchByPlace(place);
    } catch (err: any) {
      error.value = err.message || "Failed to search dealers";
      console.error("Error searching dealers:", err);
    } finally {
      loading.value = false;
    }
  };

  const searchByRadius = async (
    lat: number,
    lng: number,
    radius: number = 10
  ) => {
    loading.value = true;
    error.value = null;
    try {
      dealers.value = await dealerService.searchByRadius(lat, lng, radius);
    } catch (err: any) {
      error.value = err.message || "Failed to search dealers by radius";
      console.error("Error searching dealers by radius:", err);
    } finally {
      loading.value = false;
    }
  };

  const filterByManufacturer = async (
    manufacturer: "KIA" | "Seat" | "Opel" | "Other"
  ) => {
    loading.value = true;
    error.value = null;
    try {
      dealers.value = await dealerService.filterByManufacturer(manufacturer);
    } catch (err: any) {
      error.value = err.message || "Failed to filter dealers";
      console.error("Error filtering dealers:", err);
    } finally {
      loading.value = false;
    }
  };

  const createDealer = async (dealer: Dealer) => {
    loading.value = true;
    error.value = null;
    try {
      const newDealer = await dealerService.createDealer(dealer);
      dealers.value.push(newDealer);
      return newDealer;
    } catch (err: any) {
      error.value = err.message || "Failed to create dealer";
      console.error("Error creating dealer:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDealer = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await dealerService.deleteDealer(id);
      dealers.value = dealers.value.filter((d) => d._id !== id);
    } catch (err: any) {
      error.value = err.message || "Failed to delete dealer";
      console.error("Error deleting dealer:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const resetFilters = () => {
    searchQuery.value = "";
    selectedManufacturer.value = "";
  };

  const scrapeDealers = async (
    postalCode: string,
    manufacturer: "KIA" | "Seat" | "Opel" | "All" = "All",
    save: boolean = true
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const { scrapingService } = await import("@/services/api");
      let scrapedDealers: Dealer[];

      if (save) {
        scrapedDealers = await scrapingService.scrapeAndSave(
          postalCode,
          manufacturer
        );
      } else {
        scrapedDealers = await scrapingService.scrapePreview(
          postalCode,
          manufacturer
        );
      }

      dealers.value = scrapedDealers;
      return scrapedDealers;
    } catch (err: any) {
      error.value = err.message || "Failed to scrape dealers";
      console.error("Error scraping dealers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    dealers,
    loading,
    error,
    searchQuery,
    selectedManufacturer,
    // Computed
    filteredDealers,
    // Actions
    fetchDealers,
    searchByPostalCode,
    searchByPlace,
    searchByRadius,
    filterByManufacturer,
    createDealer,
    deleteDealer,
    clearError,
    resetFilters,
    scrapeDealers,
  };
});
