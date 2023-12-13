<script setup lang="ts">
import { onMounted } from 'vue';

import Button from '@components/Button';
import Text from '@components/Text';
import Link from '@components/Link';

import { useBundleDetail } from './hooks/BundleDetail.hook';

const {
  bundleAvailable,
  refetch,
  data,
  testData,
  isLoading,
  isError,
} = useBundleDetail();
</script>

<template>
  <Text heading="4">This is Bundle detail page</Text>
  {{ isError }}
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    <Text>
      <Link :to="`/product/bundle/edit/${data.id}`">Edit {{ data.name }}</Link>
    </Text>

    <!-- Bundle Availability Ticker -->
    <Text v-if="!bundleAvailable">
      Bundle not available since one of the product has no stock.
    </Text>

    <Text heading="5">Bundle Object</Text>
    <pre>
      {{ data }}
    </pre>
    <pre>
      {{ testData }}
    </pre>
  </div>
</template>

<style lang="scss"></style>
