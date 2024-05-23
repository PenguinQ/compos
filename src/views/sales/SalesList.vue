<script setup lang="ts">
import { ref } from 'vue';
import Toolbar, { ToolbarTitle } from '@components/Toolbar';
import { TabControls, TabControl, TabPanels, TabPanel } from '@components/TabsV2';

import SalesList from './components/SalesList.vue';

const tab = ref(0);
</script>

<template>
  <Toolbar sticky>
    <ToolbarTitle>Sales List</ToolbarTitle>
    <template #extension>
      <TabControls v-model="tab" grow>
        <TabControl title="Running" />
        <TabControl title="Finished" />
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

<style lang="scss"></style>
