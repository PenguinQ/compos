<script setup lang="ts">
import { reactive, provide, ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { TabControls, TabControl, TabPanels, TabPanel } from '@components/TabsV2';
import Toolbar, { ToolbarTitle } from '@components/Toolbar';

import ProductList from './components/ProductList.vue';

type TabDataObject = {
  page: number;
  search?: string;
};

export type TabData = {
  product: TabDataObject;
  bundle: TabDataObject;
};

export type TabDataProvider = {
  tabData: TabData;
  updateTabData: (type: keyof TabData, data: TabDataObject) => void;
};

const route = useRoute();
const router = useRouter();
const tab = ref(0);
const tabData = reactive<TabData>({
  product: { page: 1, search: undefined },
  bundle: { page: 1, search: undefined },
});

const updateTabData = (type: keyof TabData, data: TabDataObject) => {
  tabData[type] = { ...tabData[type], ...data };
};

/**
 * ------------------------------------
 * Set default tab based on route query
 * ------------------------------------
 * 0 = product
 * 1 = bundle
 */
onBeforeMount(() => {
  const page = Number(route.query.page) ? Number(route.query.page) : 1;
  const search = route.query.search ? String(route.query.search) : undefined;

  switch (route.query.tab) {
    case 'bundle':
      tab.value = 1;
      tabData.bundle.page = page;
      tabData.bundle.search = search;
      break;
    default:
      tab.value = 0;
      tabData.product.page = page;
      tabData.product.search = search;
      break;
  }
});

/**
 * ---------------------------------------------------------
 * Update provider tab page whenever route parameter changes
 * ---------------------------------------------------------
 */
watch(
  () => route.query,
  (newQuery) => {
    const { tab: newTab, page: newPage, search: newSearch } = newQuery

    if (newTab === 'bundle') {
      tab.value = 1;
      tabData.bundle.page = Number(newPage);
      tabData.bundle.search = newSearch ? String(newSearch) : undefined;
    } else {
      tab.value = 0;
      tabData.product.page = Number(newPage);
      tabData.product.search = newSearch ? String(newSearch) : undefined;
    }
  },
);

const handleClickTab = (index: number) => {
  let tab, page, search;

  switch (index) {
    case 1:
      tab = 'bundle';
      page = tabData.bundle.page;
      search = tabData.bundle.search ? tabData.bundle.search : undefined;
      break;
    default:
      tab = 'product';
      page = tabData.product.page;
      search = tabData.product.search ? tabData.product.search : undefined;
      break;
  }

  router.push({ query: { ...route.query, tab, search, page } });
};

// Provider
provide('TabData', { tabData, updateTabData });
</script>

<template>
  <Toolbar autoHide sticky>
    <ToolbarTitle>Product List</ToolbarTitle>
    <template #extension>
      <TabControls v-model="tab" grow>
        <TabControl title="Product" @click="handleClickTab(0)" />
        <TabControl title="Bundle" @click="handleClickTab(1)" />
      </TabControls>
    </template>
  </Toolbar>
  <TabPanels v-model="tab">
    <TabPanel>
      <ProductList type="product" />
    </TabPanel>
    <TabPanel>
      <ProductList type="bundle" />
    </TabPanel>
  </TabPanels>
</template>
