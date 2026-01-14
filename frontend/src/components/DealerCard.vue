<template>
  <div class="dealer-card">
    <div class="dealer-header">
      <h3 class="dealer-name">{{ dealer.name }}</h3>
      <span class="manufacturer-badge" :class="manufacturerClass">
        {{ dealer.manufacturer }}
      </span>
    </div>

    <div class="dealer-info">
      <div class="info-item">
        <strong>Address:</strong>
        <p>{{ dealer.address.street }}, {{ dealer.address.postalCode }} {{ dealer.address.city }}</p>
      </div>

      <div class="info-item" v-if="dealer.contact.phone">
        <strong>Phone:</strong>
        <p>{{ dealer.contact.phone }}</p>
      </div>

      <div class="info-item" v-if="dealer.contact.email">
        <strong>Email:</strong>
        <p>{{ dealer.contact.email }}</p>
      </div>

      <div class="info-item" v-if="dealer.contact.website">
        <strong>Website:</strong>
        <a :href="dealer.contact.website" target="_blank" rel="noopener noreferrer">
          {{ dealer.contact.website }}
        </a>
      </div>

      <div class="coordinates">
        <small>Coordinates: {{ dealer.location.coordinates[1] }}, {{ dealer.location.coordinates[0] }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Dealer } from '@/types/dealer';

const props = defineProps<{
  dealer: Dealer;
}>();

const manufacturerClass = computed(() => {
  const classes: Record<string, string> = {
    KIA: 'kia',
    Seat: 'seat',
    Opel: 'opel',
    Other: 'other',
  };
  return classes[props.dealer.manufacturer] || 'other';
});
</script>

<style scoped>
.dealer-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dealer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.dealer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.dealer-name {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.manufacturer-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.manufacturer-badge.kia {
  background: #e8f5e9;
  color: #2e7d32;
}

.manufacturer-badge.seat {
  background: #fff3e0;
  color: #e65100;
}

.manufacturer-badge.opel {
  background: #e3f2fd;
  color: #1565c0;
}

.manufacturer-badge.other {
  background: #f3e5f5;
  color: #6a1b9a;
}

.dealer-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  color: #555;
  font-size: 0.9rem;
}

.info-item p {
  margin: 0;
  color: #333;
}

.info-item a {
  color: #42b983;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}

.coordinates {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.coordinates small {
  color: #999;
  font-size: 0.8rem;
}
</style>
