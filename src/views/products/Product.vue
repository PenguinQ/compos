<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Tab, Tabs } from '@components/Tabs';
import ProductList from './components/ProductList.vue';
import BundleList from './components/BundleList.vue';

const route = useRoute();
const router = useRouter();
const tab_map: { [key: string]: number } = {
  'product': 0,
  'bundle': 1,
};
const active_tab = ref(tab_map[route.query.tab as string]);

const setRouterTab = (tab: string) => {
  router.push({ query: { tab } });
};

watch(
  () => route.query.tab,
  (tab) => {
    active_tab.value = tab_map[tab as string];
  },
);

// const container = ref();
// let items = ref(new Array(20).fill('Items'));

// const isBottom = () => {
//   const view = container.value.parentElement;

//   if (view.scrollHeight - view.scrollTop === view.clientHeight) {
//     console.log('At bottom');
//     items.value.push('Items');
//   }
// };

// const handleScroll = () => {
//   isBottom();
// };
</script>

<template>
  <Tabs
    v-model="active_tab"
    grow
    sticky
    :panelContainerProps="{ class: 'product-tabs-panels' }"
  >
    <!-- <Tab
      title="Infinite Scroll"
      :panelProps="{ class: 'product-tab-panel' }"
    >
      <div class="scroll-container__wrapper" @scroll="handleScroll">
        <div ref="container" class="scroll-container">
          <div v-for="(item, index) in items" class="scroll-item">
            {{ item }} {{ index + 1 }}
          </div>
        </div>
      </div>
    </Tab> -->
    <!-- <Tab title="Infinite Scroll" padding="16px" :panelProps="{ class: 'product-tab-panel' }">
      <ProductListInfinite />
    </Tab> -->
    <Tab
      title="Product"
      padding="16px"
      lazy
      :controlProps="{
        onclick: () => setRouterTab('product'),
      }"
    >
      <ProductList />
    </Tab>
    <Tab
      title="Bundle"
      padding="16px"
      lazy
      :controlProps="{
        onclick: () => setRouterTab('bundle'),
      }"
      >
      <BundleList />
    </Tab>
  </Tabs>
</template>

<style lang="scss" scoped>
.product-tabs-panels {
  height: calc(100% - 46px);
}

.product-tab-panel {
  height: 100%;
  overflow-y: auto;
}

.scroll-container__wrapper {
  height: 100%;
  overflow-y: auto;
}

.scroll-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.scroll-item {
  height: 50px;
  display: flex;
  align-items: center;
  background-color: var(--color-neutral-2);
  padding: 16px;
}

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
