<script setup lang="ts">
import Navbar, { NavbarAction } from '@components/Navbar';
import { Tab, Tabs } from '@components/Tabs';
import ProductList from './components/ProductList.vue';
import BundleList from './components/BundleList.vue';

import { Eye } from '@icons';
</script>

<template>
  <Navbar title="Product Management">
    <Eye color="#FFF" />
    <template #action>
      <NavbarAction backgroundColor="var(--color-blue-4)">Edit</NavbarAction>
      <NavbarAction backgroundColor="var(--color-red-4)"><Eye color="#FFF" /></NavbarAction>
    </template>
  </Navbar>
  <Tabs grow sticky>
    <Tab title="Product" padding="16px">
      <ProductList />
    </Tab>
    <Tab title="Bundle" padding="16px" lazy>
      <BundleList />
    </Tab>
  </Tabs>
</template>

<style lang="scss" scoped>
.cp-navbar {
  position: sticky;
  top: 0;
}

.cp-tabs {
  position: sticky;
}
</style>
