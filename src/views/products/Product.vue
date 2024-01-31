<script setup lang="ts">
import { Tab, Tabs } from '@components/Tabs';

import ProductList from './components/ProductList.vue';
import BundleList from './components/BundleList.vue';
</script>

<template>
  <div style="background-color: var(--color-disabled-border); height: 40px;">
    <strong>Spacer</strong>
  </div>
  <Tabs grow grow-panel>
    <Tab title="Product" padding="16px">
      <ProductList />
    </Tab>
    <Tab title="Bundle" padding="16px" lazy>
      <BundleList />
    </Tab>
  </Tabs>
</template>

<style lang="scss"></style>
