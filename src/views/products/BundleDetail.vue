<script setup lang="ts">
import { onMounted } from 'vue';

import Button from '@components/Button';
import Link from '@components/Link';

import { useBundleDetail } from './hooks';

const {
  data,
  isLoading,
} = useBundleDetail();
</script>

<template>
  <p>This is Bundle detail page</p>
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
