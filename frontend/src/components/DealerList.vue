<template>
  <div class="dealer-list">
    <div v-if="loading" class="loading">Loading dealers...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="filteredDealers.length === 0" class="no-results">
      No dealers found. Try a different search.
    </div>
    <div v-else class="dealers-grid">
      <DealerCard
        v-for="dealer in filteredDealers"
        :key="dealer._id"
        :dealer="dealer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDealerStore } from '@/stores/dealerStore';
import DealerCard from './DealerCard.vue';

const dealerStore = useDealerStore();

const loading = computed(() => dealerStore.loading);
const error = computed(() => dealerStore.error);
const filteredDealers = computed(() => dealerStore.filteredDealers);
</script>

<style scoped>
.dealer-list {
  margin-top: 2rem;
}

.loading,
.error,
.no-results {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading {
  color: #42b983;
}

.error {
  color: #e74c3c;
}

.no-results {
  color: #6c757d;
}

.dealers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .dealers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
