<script setup lang="ts">
import { onUnmounted } from 'vue';

import Button from '@components/Button';
import Text from '@components/Text';
import Link from '@components/Link';

import { useProductDetail } from './hooks/ProductDetail.hook';

const {
  data,
  isError,
  isLoading,
  deleteProduct,
  deleteProductLoading,
} = useProductDetail();
</script>

<template>
  <Text heading="4">This is Product detail page</Text>
  <div v-if="isLoading">Loading... {{ isLoading }}</div>
  <div v-else>
    <div style="margin-top: 12px;">
      <Link :to="`/product/edit/${data.id}`">Edit {{ data.name }}</Link>
    </div>
    <Button @click="deleteProduct">Delete Product</Button>
    <pre>
      {{ data }}
    </pre>
    <img v-for="image in data.image" :src="image" />
  </div>
</template>

<style lang="scss"></style>
