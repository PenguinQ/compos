<script setup lang="ts">
import { ref, watch } from 'vue';

import Checkbox from '@components/Checkbox';
import Button from '@components/Button';
import Dialog from '@components/Dialog';
import { Tabs, Tab } from '@components/Tabs';
import Toolbar, { ToolbarAction, ToolbarSpacer } from '@components/Toolbar';
import { IconX } from '@icons';

import { useProductSelection } from './hooks/ProductSelection.hook';

type ProductSelectionProps = {
  type?: 'product' | 'bundle';
};

const props = defineProps<ProductSelectionProps>();
const {
  dialog,
  load_product,
  load_bundle,
  productsData,
  productsPending,
  productsLoading,
  productsError,
  productsRefetch,
} = useProductSelection();
const default_tab_index = 1;
const active_tab_index = ref(default_tab_index);

watch(
  active_tab_index,
  (new_index) => {
    if (new_index === 0) load_product.value = true;
    if (new_index === 1) load_bundle.value = true;
  },
);

const loadSelection = () => {
  if (active_tab_index.value === 0) load_product.value = true;
  if (active_tab_index.value === 1) load_bundle.value = true;
};

const handleEnter = () => {
  if (!load_product.value) {
    load_product.value = true;
  } else {
    productsRefetch();
  }
}
</script>

<template>
  <div class="product-selector">
    <div>{{ productsData }}</div>
    {{ productsPending }}
    <Button @click="dialog = true">Open Dialog</Button>
    <Dialog
      v-model="dialog"
      fullscreen
      @enter="load_product = true"
      @leave="load_product = false"
    >
      <template #header>
        <Toolbar>
          <ToolbarAction icon>
            <IconX @click="dialog = false" size="40" />
          </ToolbarAction>
          <ToolbarSpacer />
        </Toolbar>
      </template>
      <div v-if="productsLoading || productsPending">Loading...</div>
      <div v-else v-for="product of productsData.products">
        <picture>
          <img :src="product.image" :alt="`${product.name} image`" />
        </picture>
        {{ product.name }}
        <div v-for="variant of product.variant">
          <picture>
            <img :src="variant.image" :alt="`${variant.name} image`" />
          </picture>
          {{ variant.name }}
        </div>
      </div>
    </Dialog>

    <!-- <Dialog
      v-model="dialog"
      fullscreen
      @enter="loadSelection"
      @after-leave="active_tab_index = default_tab_index"
    >
      <template #header>
        <Toolbar>
          <ToolbarAction icon>
            <IconX @click="dialog = false" size="40" />
          </ToolbarAction>
          <ToolbarSpacer />
        </Toolbar>
      </template>
      <Tabs v-model="active_tab_index" grow>
        <Tab title="Product">
          {{ productsData }}
        </Tab>
        <Tab title="Bundle">
          {{ bundlesData }}
        </Tab>
      </Tabs>
    </Dialog> -->
  </div>
</template>

<style lang="scss"></style>
