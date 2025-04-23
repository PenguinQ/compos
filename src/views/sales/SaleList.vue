<script setup lang="ts">
import { reactive, provide, ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Common Components
import {
  Header,
  Content,
  Toolbar,
  ToolbarTitle,
  TabControl,
  TabControls,
  TabPanel,
  TabPanels,
} from '@/components';

// View Components
import SaleList from './components/SaleList.vue';

type ToolbarInstance = InstanceType<typeof Toolbar>;

type TabDataObject = {
  page: number;
  search?: string;
};

export type TabData = {
  running: TabDataObject;
  finished: TabDataObject;
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
  running : { page: 1, search: undefined },
  finished: { page: 1, search: undefined },
});

const updateTabData = (type: keyof TabData, data: TabDataObject) => {
  tabData[type] = { ...tabData[type], ...data };
};

onBeforeMount(() => {
  const page   = Number(route.query.page) ? Number(route.query.page) : 1;
  const search = route.query.search ? String(route.query.search) : undefined;

  switch (route.query.tab) {
    case 'finished':
      tab.value               = 1;
      tabData.finished.page   = page;
      tabData.finished.search = search;
      break;
    default:
      tab.value              = 0;
      tabData.running.page   = page;
      tabData.running.search = search;
      break;
  }
});

watch(
  () => route.query,
  (newQuery) => {
    const { tab: newTab, page: newPage, search: newSearch } = newQuery

    if (newTab === 'finished') {
      tab.value               = 1;
      tabData.finished.page   = Number(newPage);
      tabData.finished.search = newSearch ? String(newSearch) : undefined;
    } else {
      tab.value              = 0;
      tabData.running.page   = Number(newPage);
      tabData.running.search = newSearch ? String(newSearch) : undefined;
    }
  },
);

const handleClickTab = (index: number) => {
  let tab, page, search;

  switch (index) {
    case 1:
      tab    = 'finished';
      page   = tabData.finished.page;
      search = tabData.finished.search ? tabData.finished.search : undefined;
      break;
    default:
      tab    = 'running';
      page   = tabData.running.page;
      search = tabData.running.search ? tabData.running.search : undefined;
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
      <ToolbarTitle>Sales Management</ToolbarTitle>
      <template #extensions>
        <TabControls v-model="tab" grow>
          <TabControl title="Running" @click="handleClickTab(0)" />
          <TabControl title="Finished" @click="handleClickTab(1)" />
        </TabControls>
      </template>
    </Toolbar>
  </Header>
  <Content @scroll="handleScroll">
    <TabPanels v-model="tab">
      <TabPanel>
        <SaleList status="running" />
      </TabPanel>
      <TabPanel lazy>
        <SaleList status="finished" />
      </TabPanel>
    </TabPanels>
  </Content>
</template>
