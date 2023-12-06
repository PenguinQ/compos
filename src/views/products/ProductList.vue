<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import Button from '@components/Button';
import Link from '@components/Link';
import Text from '@components/Text';

import { useProducts, useBundle } from './hooks';

const router = useRouter();
const testKeep = ref(false);

const {
  paginationData: productData,
  isLoading: productLoading,
  nextPage: productNextPage,
} = useProducts();
const {
  paginationData: bundleData,
  isLoading: bundleLoading,
  nextPage: bundleNextPage,
} = useBundle();

const handleClick = () => {
  router.push('/product/add');
};
</script>

<template>
  <Text>This is Product List page</Text>
  <div v-if="productLoading">Product loading...</div>
  <div v-else v-for="product in productData">
    <Link :to="`/product/${product.id}`">
      {{ product.name }} {{ product.created_at }} {{ product.id }}
    </Link>
  </div>
  <div>
    <Button @click="productNextPage">Product Next Page</Button>
  </div>

  <hr />

  <div v-if="bundleLoading">Bundle loading...</div>
  <div v-else v-for="bundle in bundleData">
    <Link :to="`/product/bundle/${bundle.id}`">
      {{ bundle.name }} {{ bundle.created_at }} {{ bundle.id }}
    </Link>
  </div>
  <div>
    <Button @click="bundleNextPage">Bundle Next Page</Button>
  </div>

  <hr />

  <div>
    <Button @click="handleClick">Go to Add Product Page</Button>
  </div>

  <hr />

  <!-- <div>
    <div>{{ testKeep }}</div>
    <Button @click="testKeep = true">Test Keep Alive</Button>
  </div> -->

</template>

<style lang="scss" scoped></style>
