<script setup lang="ts">
import { ref } from 'vue';
import { TabControls, TabControl, TabPanels, TabPanel } from '@components/TabsV2';
import Toolbar, { ToolbarTitle } from '@components/Toolbar';
import ProductList from './components/ProductList.vue';
import BundleList from './components/BundleList.vue';

const tab = ref(0);
</script>

<template>
    <Toolbar sticky>
      <ToolbarTitle>Product List</ToolbarTitle>
      <template #extension>
        <TabControls v-model="tab" grow>
          <TabControl title="Product" />
          <TabControl title="Bundle" />
        </TabControls>
      </template>
    </Toolbar>
    <TabPanels v-model="tab">
      <TabPanel>
        <ProductList type="product" />
      </TabPanel>
      <TabPanel lazy>
        <ProductList type="bundle" />
        <!-- <BundleList /> -->
      </TabPanel>
    </TabPanels>

    <!-- <Tabs
      v-model="active_tab"
      grow
      sticky
    >
      <Tab
        title="Product"
        lazy
        :controlProps="{
          onclick: () => setRouterTab('product'),
        }"
      >
        <ProductList />
      </Tab>
      <Tab
        title="Bundle"
        lazy
        :controlProps="{
          onclick: () => setRouterTab('bundle'),
        }"
        >
        <BundleList />
      </Tab>
    </Tabs> -->
</template>

<style lang="scss"></style>
