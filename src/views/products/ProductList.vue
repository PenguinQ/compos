<script setup lang="ts">
import { onBeforeMount } from 'vue';

import Text from '@components/Text';
import Link from '@components/Link';

import { setSampleData } from '@database/query/product';

import { useTest, useProducts } from './hooks';

onBeforeMount(() => {
  setSampleData();
});

const {
  data: products,
  isLoading,
} = useTest();
</script>

<template>
  <Text>This is Product List page</Text>
  <div v-if="isLoading">Loading...</div>
  <div v-else v-for="product in products">
    <Link :to="`/product/${product.id}`">{{ product.name }}</Link>
  </div>
</template>

<style lang="scss" scoped></style>
