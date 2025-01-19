<script setup lang="ts">
import { reactive, provide, ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Common Components
import {
  Header,
  Content,
  TabControl,
  TabControls,
  TabPanel,
  TabPanels,
  Toolbar,
  ToolbarTitle,
} from '@/components';

// View Components
import ProductList from './components/ProductList.vue';

type ToolbarInstance = InstanceType<typeof Toolbar>;

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

const route      = useRoute();
const router     = useRouter();
const toolbarRef = ref<ToolbarInstance | null>(null);
const tab        = ref(0);
const tabData    = reactive<TabData>({
  product: { page: 1, search: undefined },
  bundle : { page: 1, search: undefined },
});

const updateTabData = (type: keyof TabData, data: TabDataObject) => {
  tabData[type] = { ...tabData[type], ...data };
};

onBeforeMount(() => {
  const page   = Number(route.query.page) ? Number(route.query.page) : 1;
  const search = route.query.search ? String(route.query.search) : undefined;

  switch (route.query.tab) {
    case 'bundle':
      tab.value             = 1;
      tabData.bundle.page   = page;
      tabData.bundle.search = search;
      break;
    default:
      tab.value              = 0;
      tabData.product.page   = page;
      tabData.product.search = search;
      break;
  }
});

watch(
  () => route.query,
  (newQuery) => {
    const { tab: newTab, page: newPage, search: newSearch } = newQuery

    if (newTab === 'bundle') {
      tab.value             = 1;
      tabData.bundle.page   = Number(newPage);
      tabData.bundle.search = newSearch ? String(newSearch) : undefined;
    } else {
      tab.value              = 0;
      tabData.product.page   = Number(newPage);
      tabData.product.search = newSearch ? String(newSearch) : undefined;
    }
  },
);

const handleClickTab = (index: number) => {
  let tab, page, search;

  switch (index) {
    case 1:
      tab    = 'bundle';
      page   = tabData.bundle.page;
      search = tabData.bundle.search ? tabData.bundle.search : undefined;
      break;
    default:
      tab    = 'product';
      page   = tabData.product.page;
      search = tabData.product.search ? tabData.product.search : undefined;
      break;
  }

  router.push({ query: { ...route.query, tab, search, page } });
};

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;

  if (target.scrollTop > 0) {
    toolbarRef.value?.toggleToolbar(true);
  } else {
    toolbarRef.value?.toggleToolbar(false);
  }
};

provide('TabData', { tabData, updateTabData });
</script>

<template>
  <Header>
    <Toolbar ref="toolbarRef">
      <ToolbarTitle>Products Management</ToolbarTitle>
      <template #extension>
        <TabControls v-model="tab" grow>
          <TabControl title="Products" @click="handleClickTab(0)" />
          <TabControl title="Bundles" @click="handleClickTab(1)" />
        </TabControls>
      </template>
    </Toolbar>
  </Header>
  <Content @scroll="handleScroll">
    <TabPanels v-model="tab">
      <TabPanel>
        <ProductList type="product" />
      </TabPanel>
      <TabPanel lazy>
        <ProductList type="bundle" />
      </TabPanel>
    </TabPanels>
  </Content>
</template>
