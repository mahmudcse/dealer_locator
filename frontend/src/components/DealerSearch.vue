<template>
  <div class="dealer-search">
    <div class="search-container">
      <div class="search-input-group">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Enter postal code or place name..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-button">Search</button>
        <button @click="handleReset" class="reset-button">Reset</button>
      </div>

      <div class="filter-group">
        <label>Filter by Manufacturer:</label>
        <select v-model="selectedManufacturer" @change="handleManufacturerFilter" class="manufacturer-select">
          <option value="">All</option>
          <option value="KIA">KIA</option>
          <option value="Seat">Seat</option>
          <option value="Opel">Opel</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div class="scrape-section">
        <label>Scrape from Manufacturer Websites:</label>
        <div class="scrape-buttons">
          <select v-model="scrapeManufacturer" class="manufacturer-select">
            <option value="All">All Manufacturers</option>
            <option value="KIA">KIA</option>
            <option value="Seat">Seat</option>
            <option value="Opel">Opel</option>
          </select>
          <button
            @click="handleScrape"
            :disabled="scraping || !searchInput.trim()"
            class="scrape-button"
          >
            {{ scraping ? "Scraping..." : "Scrape Dealers" }}
          </button>
        </div>
        <small v-if="scrapeResult" class="scrape-result">{{ scrapeResult }}</small>
      </div>

      <div class="export-buttons">
        <button @click="exportCSV" class="export-button">Export CSV</button>
        <button @click="exportExcel" class="export-button">Export Excel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDealerStore } from "@/stores/dealerStore";
import { dealerService } from "@/services/api";

const dealerStore = useDealerStore();
const searchInput = ref("");
const selectedManufacturer = ref("");
const scrapeManufacturer = ref<"KIA" | "Seat" | "Opel" | "All">("All");
const scraping = ref(false);
const scrapeResult = ref("");

const handleSearch = async () => {
  if (!searchInput.value.trim()) {
    dealerStore.fetchDealers();
    return;
  }

  // Sync manufacturer filter with store before search
  dealerStore.selectedManufacturer = selectedManufacturer.value as any;

  // Check if it's a postal code (numbers only) or place name
  if (/^\d+$/.test(searchInput.value.trim())) {
    const postalCode = searchInput.value.trim();
    await dealerStore.searchByPostalCode(postalCode);
    
    // If no results found (check raw dealers, not filtered), automatically scrape
    if (dealerStore.dealers.length === 0) {
      scrapeResult.value = "No dealers found in database. Scraping from manufacturer websites...";
      scraping.value = true;
      
      try {
        const dealers = await dealerStore.scrapeDealers(
          postalCode,
          scrapeManufacturer.value,
          true // Save to database
        );
        
        // After scraping, search again to get the newly saved dealers
        await dealerStore.searchByPostalCode(postalCode);
        
        scrapeResult.value = `Found and saved ${dealers.length} dealers from manufacturer websites!`;
      } catch (error: any) {
        scrapeResult.value = `Scraping failed: ${error.message || "Unknown error"}`;
        console.error("Auto-scraping error:", error);
      } finally {
        scraping.value = false;
      }
    }
  } else {
    await dealerStore.searchByPlace(searchInput.value.trim());
  }
};

const handleScrape = async () => {
  if (!searchInput.value.trim()) {
    alert("Please enter a postal code to scrape dealers");
    return;
  }

  // Only allow scraping with postal codes
  if (!/^\d+$/.test(searchInput.value.trim())) {
    alert("Scraping requires a postal code (numbers only)");
    return;
  }

  scraping.value = true;
  scrapeResult.value = "";

  try {
    const postalCode = searchInput.value.trim();
    const dealers = await dealerStore.scrapeDealers(
      postalCode,
      scrapeManufacturer.value,
      true // Save to database
    );

    scrapeResult.value = `Successfully scraped and saved ${dealers.length} dealers!`;
    // Refresh the list
    await dealerStore.fetchDealers();
  } catch (error: any) {
    scrapeResult.value = `Error: ${error.message || "Failed to scrape dealers"}`;
    console.error("Scraping error:", error);
  } finally {
    scraping.value = false;
  }
};

const handleReset = () => {
  searchInput.value = '';
  selectedManufacturer.value = '';
  dealerStore.resetFilters();
  dealerStore.fetchDealers();
};

const handleManufacturerFilter = () => {
  dealerStore.selectedManufacturer = selectedManufacturer.value as any;
  if (selectedManufacturer.value) {
    dealerStore.filterByManufacturer(selectedManufacturer.value as any);
  } else {
    dealerStore.fetchDealers();
  }
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const exportCSV = async () => {
  try {
    const params: any = {};
    if (selectedManufacturer.value) params.manufacturer = selectedManufacturer.value;
    if (searchInput.value) {
      if (/^\d+$/.test(searchInput.value.trim())) {
        params.postalCode = searchInput.value.trim();
      } else {
        params.place = searchInput.value.trim();
      }
    }
    const blob = await dealerService.exportToCSV(params);
    downloadFile(blob, 'dealers.csv');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export CSV');
  }
};

const exportExcel = async () => {
  try {
    const params: any = {};
    if (selectedManufacturer.value) params.manufacturer = selectedManufacturer.value;
    if (searchInput.value) {
      if (/^\d+$/.test(searchInput.value.trim())) {
        params.postalCode = searchInput.value.trim();
      } else {
        params.place = searchInput.value.trim();
      }
    }
    const blob = await dealerService.exportToExcel(params);
    downloadFile(blob, 'dealers.xlsx');
  } catch (error) {
    console.error('Error exporting Excel:', error);
    alert('Failed to export Excel');
  }
};
</script>

<style scoped>
.dealer-search {
  margin-bottom: 2rem;
}

.search-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-button,
.reset-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.search-button {
  background: #42b983;
  color: white;
}

.search-button:hover {
  background: #35a372;
}

.reset-button {
  background: #6c757d;
  color: white;
}

.reset-button:hover {
  background: #5a6268;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.manufacturer-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 200px;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.export-button {
  padding: 0.5rem 1rem;
  border: 1px solid #42b983;
  background: white;
  color: #42b983;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.export-button:hover {
  background: #42b983;
  color: white;
}

.scrape-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.scrape-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.scrape-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.scrape-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  background: #007bff;
  color: white;
  transition: background 0.2s;
}

.scrape-button:hover:not(:disabled) {
  background: #0056b3;
}

.scrape-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.scrape-result {
  display: block;
  margin-top: 0.5rem;
  color: #28a745;
  font-weight: 500;
}
</style>
