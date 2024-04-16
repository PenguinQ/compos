<script setup lang="ts">
import Navbar from '@components/Navbar';
import { Tab, Tabs } from '@components/Tabs';

import ProductList from './components/ProductList.vue';
import BundleList from './components/BundleList.vue';
import TestScope from './TestScope.vue';
</script>

<template>
  <Tabs grow sticky>
    <!-- <Tab title="Testing 1" padding="16px">
      <div>Scoped tab content 1</div>
    </Tab>
    <Tab title="Testing 2" padding="16px" lazy>
      <div>Scoped tab content 2</div>
    </Tab> -->
    <Tab title="Product" padding="16px">
      <ProductList />
    </Tab>
    <Tab title="Bundle" padding="16px" lazy>
      <BundleList />
    </Tab>
  </Tabs>
</template>

<style lang="scss">
.cp-tabs-controls {
  // margin: -16px -16px 0 -16px;
}

.cp-tabs-panels {
  // margin: 0 -16px;
}

.cp-navbar {
  position: sticky;
  top: 0;
}

.cp-tabs {
  position: sticky;
}
</style>
