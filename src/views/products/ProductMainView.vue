<script setup lang="ts">
import { Tab, Tabs } from '@components/Tabs';
</script>

<template>
  <Tabs grow sticky>
    <Tab title="Running" padding="16px">
      <SalesList status="running" />
    </Tab>
    <Tab title="Finished" padding="16px" lazy>
      <SalesList status="finished" />
    </Tab>
  </Tabs>
</template>

<style lang="scss" scoped></style>
