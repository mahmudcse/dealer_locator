<template>
  <div class="home-view">
    <div class="container">
      <h1 class="title">Dealer Locator</h1>
      <p class="subtitle">Find dealers by postal code, place name, or manufacturer</p>

      <DealerSearch @search="handleSearch" />
      <DealerList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDealerStore } from '@/stores/dealerStore';
import DealerSearch from '@/components/DealerSearch.vue';
import DealerList from '@/components/DealerList.vue';

const dealerStore = useDealerStore();

onMounted(() => {
  dealerStore.fetchDealers();
});

const handleSearch = () => {
  // Search is handled by DealerSearch component
};
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>
