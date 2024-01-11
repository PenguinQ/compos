<script setup lang="ts">
import Button from '@components/Button';
import Text from '@components/Text';
import Link from '@components/Link';

import { useProductDetail } from './hooks/ProductDetail.hook';

const { data, isLoading } = useProductDetail();
</script>

<template>
  <Text heading="4">This is Product detail page</Text>
  <div v-if="isLoading">Loading... {{ isLoading }}</div>
  <div v-else>
    <div style="margin-top: 12px;">
      <Link :to="`/product/edit/${data.id}`">Edit {{ data.name }}</Link>
    </div>
    <pre>
      {{ data }}
    </pre>
  </div>
</template>

<style lang="scss"></style>
