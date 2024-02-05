<script setup lang="ts">
import Navbar, { NavbarAction } from '@components/Navbar';
import { Tab, Tabs } from '@components/Tabs';
import ProductList from './components/ProductList.vue';
import BundleList from './components/BundleList.vue';
</script>

<template>
  <Navbar title="Product">
    <NavbarAction>Edit</NavbarAction>
    <NavbarAction>Save</NavbarAction>
  </Navbar>
  <Tabs grow>
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
