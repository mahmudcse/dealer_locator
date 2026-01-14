import axios from "axios";
import * as cheerio from "cheerio";

interface ScrapedDealer {
  name: string;
  manufacturer: "KIA" | "Seat" | "Opel";
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

// Helper function to geocode address (using a free geocoding service)
const geocodeAddress = async (
  address: string,
  city: string,
  postalCode: string
): Promise<[number, number] | null> => {
  try {
    // Using Nominatim (OpenStreetMap) geocoding service
    const query = encodeURIComponent(`${address}, ${postalCode} ${city}, Germany`);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "DealerLocator/1.0",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const { lon, lat } = response.data[0];
      return [parseFloat(lon), parseFloat(lat)];
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
};

// Scrape KIA dealers
export const scrapeKIADealers = async (postalCode: string): Promise<ScrapedDealer[]> => {
  try {
    // KIA website uses JavaScript, so we'll try to find API endpoints or use browser automation
    // For now, let's try to get the page and see if we can extract data
    
    const response = await axios.get(
      `https://www.kia.com/de/haendlersuche/#/`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }
    );

    // KIA likely uses JavaScript to load dealers, so we need to check for API endpoints
    // Let's try to find if there's an API endpoint
    const dealers: ScrapedDealer[] = [];

    // Try to find API endpoint pattern
    // KIA might have an API at: /api/dealers or similar
    try {
      // Common pattern for dealer APIs
      const apiResponse = await axios.post(
        "https://www.kia.com/de/api/dealers/search",
        {
          postalCode,
          country: "DE",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (apiResponse.data && apiResponse.data.dealers) {
        for (const dealer of apiResponse.data.dealers) {
          const coords = await geocodeAddress(
            dealer.address?.street || "",
            dealer.address?.city || "",
            dealer.address?.postalCode || postalCode
          );

          dealers.push({
            name: dealer.name || dealer.dealerName || "KIA Dealer",
            manufacturer: "KIA",
            address: {
              street: dealer.address?.street || dealer.street || "",
              city: dealer.address?.city || dealer.city || "",
              postalCode: dealer.address?.postalCode || dealer.postalCode || postalCode,
              country: "Germany",
            },
            location: coords
              ? {
                  type: "Point",
                  coordinates: coords,
                }
              : undefined,
            contact: {
              phone: dealer.phone || dealer.telephone,
              email: dealer.email,
              website: dealer.website || dealer.url,
            },
          });
        }
      }
    } catch (apiError) {
      // If API doesn't work, we'll need browser automation
      console.log("KIA API endpoint not found, would need browser automation");
    }

    return dealers;
  } catch (error: any) {
    console.error("Error scraping KIA dealers:", error.message);
    throw new Error(`Failed to scrape KIA dealers: ${error.message}`);
  }
};

// Scrape Seat dealers
export const scrapeSeatDealers = async (postalCode: string): Promise<ScrapedDealer[]> => {
  try {
    const dealers: ScrapedDealer[] = [];

    // Try Seat API endpoint
    try {
      const response = await axios.post(
        "https://www.seat.de/api/dealers/search",
        {
          postalCode,
          country: "DE",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (response.data && response.data.dealers) {
        for (const dealer of response.data.dealers) {
          const coords = await geocodeAddress(
            dealer.address?.street || "",
            dealer.address?.city || "",
            dealer.address?.postalCode || postalCode
          );

          dealers.push({
            name: dealer.name || dealer.dealerName || "Seat Dealer",
            manufacturer: "Seat",
            address: {
              street: dealer.address?.street || dealer.street || "",
              city: dealer.address?.city || dealer.city || "",
              postalCode: dealer.address?.postalCode || dealer.postalCode || postalCode,
              country: "Germany",
            },
            location: coords
              ? {
                  type: "Point",
                  coordinates: coords,
                }
              : undefined,
            contact: {
              phone: dealer.phone || dealer.telephone,
              email: dealer.email,
              website: dealer.website || dealer.url,
            },
          });
        }
      }
    } catch (apiError) {
      console.log("Seat API endpoint not found, would need browser automation");
    }

    return dealers;
  } catch (error: any) {
    console.error("Error scraping Seat dealers:", error.message);
    throw new Error(`Failed to scrape Seat dealers: ${error.message}`);
  }
};

// Scrape Opel dealers
export const scrapeOpelDealers = async (postalCode: string): Promise<ScrapedDealer[]> => {
  try {
    const dealers: ScrapedDealer[] = [];

    // Try Opel API endpoint
    try {
      const response = await axios.post(
        "https://www.opel.de/api/dealers/search",
        {
          postalCode,
          country: "DE",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (response.data && response.data.dealers) {
        for (const dealer of response.data.dealers) {
          const coords = await geocodeAddress(
            dealer.address?.street || "",
            dealer.address?.city || "",
            dealer.address?.postalCode || postalCode
          );

          dealers.push({
            name: dealer.name || dealer.dealerName || "Opel Dealer",
            manufacturer: "Opel",
            address: {
              street: dealer.address?.street || dealer.street || "",
              city: dealer.address?.city || dealer.city || "",
              postalCode: dealer.address?.postalCode || dealer.postalCode || postalCode,
              country: "Germany",
            },
            location: coords
              ? {
                  type: "Point",
                  coordinates: coords,
                }
              : undefined,
            contact: {
              phone: dealer.phone || dealer.telephone,
              email: dealer.email,
              website: dealer.website || dealer.url,
            },
          });
        }
      }
    } catch (apiError) {
      console.log("Opel API endpoint not found, would need browser automation");
    }

    return dealers;
  } catch (error: any) {
    console.error("Error scraping Opel dealers:", error.message);
    throw new Error(`Failed to scrape Opel dealers: ${error.message}`);
  }
};

// Main scraping function that uses browser automation
export const scrapeDealersWithBrowser = async (
  manufacturer: "KIA" | "Seat" | "Opel",
  postalCode: string
): Promise<ScrapedDealer[]> => {
  try {
    // This will use playwright for browser automation
    // For now, return empty array - we'll implement this with playwright
    console.log(`Scraping ${manufacturer} dealers for postal code: ${postalCode}`);
    
    // Placeholder - will implement with playwright
    return [];
  } catch (error: any) {
    console.error(`Error scraping ${manufacturer} dealers:`, error.message);
    throw new Error(`Failed to scrape ${manufacturer} dealers: ${error.message}`);
  }
};

// Unified scraping function
export const scrapeDealers = async (
  manufacturer: "KIA" | "Seat" | "Opel" | "All",
  postalCode: string
): Promise<ScrapedDealer[]> => {
  const allDealers: ScrapedDealer[] = [];

  if (manufacturer === "KIA" || manufacturer === "All") {
    try {
      const kiaDealers = await scrapeKIADealers(postalCode);
      allDealers.push(...kiaDealers);
    } catch (error) {
      console.error("Failed to scrape KIA:", error);
    }
  }

  if (manufacturer === "Seat" || manufacturer === "All") {
    try {
      const seatDealers = await scrapeSeatDealers(postalCode);
      allDealers.push(...seatDealers);
    } catch (error) {
      console.error("Failed to scrape Seat:", error);
    }
  }

  if (manufacturer === "Opel" || manufacturer === "All") {
    try {
      const opelDealers = await scrapeOpelDealers(postalCode);
      allDealers.push(...opelDealers);
    } catch (error) {
      console.error("Failed to scrape Opel:", error);
    }
  }

  return allDealers;
};
