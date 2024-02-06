<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import { Tab, Tabs } from '@components/Tabs';
import { BottomNavbar, BottomNavbarButton } from '@components/BottomNavbar';

import {
  Archive,
  ArchiveFill,
  Basket,
  BasketFill,
} from '@icons';
</script>

<template>
  <div class="page">
    <div class="page__view">
      <RouterView />
    </div>
    <BottomNavbar class="page__navigation">
      <BottomNavbarButton
        title="Sales"
        :icon="($route.name as string).startsWith('sales') ? BasketFill : Basket"
        :active="($route.name as string).startsWith('sales')"
        @click="$router.push('/sales')"
      />
      <BottomNavbarButton
        title="Product Management"
        :icon="($route.name as string).startsWith('product') ? ArchiveFill : Archive"
        :active="($route.name as string).startsWith('product')"
        @click="$router.push('/product')"
      />
    </BottomNavbar>
  </div>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "view"
    "navigation";

  &__view {
    grid-area: view;
  }

  &__navigation {
    grid-area: navigation;
    align-self: end;
    position: sticky;
    bottom: 0;
  }
}
</style>
