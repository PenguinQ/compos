<script setup lang="ts">
import { onMounted } from 'vue';

import Button from '@components/Button';
import Text from '@components/Text';
import Link from '@components/Link';

import { useBundleDetail } from './hooks/BundleDetail.hook';

const {
  data,
  isLoading,
} = useBundleDetail();
</script>

<template>
  <Text heading="4">This is Product detail page</Text>
  <div v-if="isLoading">Loading...</div>
  <div v-else>
    {{ data }}
    <div>
      <Link :to="`/product/bundle/edit/${data.id}`">Edit {{ data.name }}</Link>
    </div>
  </div>
  <!-- <div v-if="isLoading">Loading...</div>
  <div v-else>
    {{ product }}
    <div>
      <Link :to="`/product/edit/${product.id}`">Edit {{ product.name }}</Link>
    </div>
  </div> -->
</template>

<style lang="scss"></style>
