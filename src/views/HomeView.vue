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

const toggle = ref(true);
</script>

<template>
  <div class="page">
    <button @click="() => toggle = !toggle">Test</button>
    <div ref="wrapper" class="page__wrapper">
      <Tabs
        grow
        :controlProps="{
          'data-control-global': toggle ? true : undefined,
        }"
        :panelProps="{
          'data-panel-global': toggle ? true : undefined,
        }"
      >
        <Tab
          padding="16px"
          data-berak
          :title="toggle ? 'Sales' : 'Not Sales'"
          :controlProps="{
            'data-cp-control': 'sales',
            onClick: () => console.log('Sales control'),
          }"
          :panelProps="{
            class: toggle ? 'berak' : '',
            'data-cp-panel': 'sales',
            onClick: () => console.log('Sales tab'),
          }"
        >
          Sales
        </Tab>
        <Tab
          title="Product"
          padding="16px"
          :controlProps="{
            'data-cp-control': 'product',
            onClick: () => console.log('Product control'),
          }"
          :panelProps="{
            'data-cp-panel': 'product',
            onClick: () => console.log('Product tab'),
          }"
        >
          Product
        </Tab>
      </Tabs>
    </div>
    <!-- <RouterView /> -->
    <!-- <BottomNavbar class="page__bottomNav">
      <BottomNavbarButton
        title="Sales"
        :icon="($route.name as string).startsWith('sales') ? BasketFill : Basket"
        :active="($route.name as string).startsWith('sales')"
        @click="$router.push('/sales')"
      />
      <BottomNavbarButton
        title="Product"
        :icon="($route.name as string).startsWith('product') ? ArchiveFill : Archive"
        :active="($route.name as string).startsWith('product')"
        @click="$router.push('/product')"
      />
    </BottomNavbar> -->
  </div>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__wrapper {
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: auto;
  }

  &__bottomNav {
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
  }
}
</style>
