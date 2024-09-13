<script setup lang="ts">
import { reactive, provide, ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Toolbar, { ToolbarTitle } from '@components/Toolbar';
import { TabControls, TabControl, TabPanels, TabPanel } from '@components/TabsV2';

import SalesList from './components/SalesList.vue';

type TabDataObject = {
  page: number;
  search?: string;
};

export type TabDataSales = {
  running: TabDataObject;
  finished: TabDataObject;
};

export type TabDataProvider = {
  tabData: TabDataSales;
  updateTabData: (type: keyof TabDataSales, data: TabDataObject) => void;
};

const route = useRoute();
const router = useRouter();
const tab = ref(0);
const tabData = reactive<TabDataSales>({
  running: { page: 1, search: undefined },
  finished: { page: 1, search: undefined },
});

const updateTabData = (type: keyof TabDataSales, data: TabDataObject) => {
  tabData[type] = { ...tabData[type], ...data };
};

/**
 * ------------------------------------
 * Set default tab based on route query
 * ------------------------------------
 * 0 = running
 * 1 = finished
 */
 onBeforeMount(() => {
  const page = Number(route.query.page) ? Number(route.query.page) : 1;
  const search = route.query.search ? String(route.query.search) : undefined;

  switch (route.query.tab) {
    case 'finished':
      tab.value = 1;
      tabData.finished.page = page;
      tabData.finished.search = search;
      break;
    default:
      tab.value = 0;
      tabData.running.page = page;
      tabData.running.search = search;
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

    if (newTab === 'finished') {
      tab.value = 1;
      tabData.finished.page = Number(newPage);
      tabData.finished.search = newSearch ? String(newSearch) : undefined;
    } else {
      tab.value = 0;
      tabData.running.page = Number(newPage);
      tabData.running.search = newSearch ? String(newSearch) : undefined;
    }

    // console.log('[Provider] running:', { ...tabData.running });
    // console.log('[Provider] finished:', { ...tabData.finished });
  },
);

const handleClickTab = (index: number) => {
  // const tabMap: { [key: number]: string } = {
  //   0: 'running',
  //   1: 'finished',
  // };
  // const tab = tabMap[index];
  // const page = tabData[tabMap[index]].page;
  // const search =  tabData[tabMap[index]].search ? tabData[tabMap[index]].search : undefined;

  let tab, page, search;

  switch (index) {
    case 1:
      tab = 'finished';
      page = tabData.finished.page;
      search = tabData.finished.search ? tabData.finished.search : undefined;
      break;
    default:
      tab = 'running';
      page = tabData.running.page;
      search = tabData.running.search ? tabData.running.search : undefined;
      break;
  }

  router.push({ query: { ...route.query, tab, search, page } });
};

// Provider
provide('TabData', { tabData, updateTabData });
</script>

<template>
  <Toolbar autoHide sticky>
    <ToolbarTitle>Sales List</ToolbarTitle>
    <template #extension>
      <TabControls v-model="tab" grow>
        <TabControl title="Running" @click="handleClickTab(0)" />
        <TabControl title="Finished" @click="handleClickTab(1)" />
      </TabControls>
    </template>
  </Toolbar>
  <TabPanels v-model="tab">
    <TabPanel>
      <SalesList status="running" />
    </TabPanel>
    <TabPanel lazy>
      <SalesList status="finished" />
    </TabPanel>
  </TabPanels>
</template>
