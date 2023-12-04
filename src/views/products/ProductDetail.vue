<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getProduct } from '@database/query/product';

const route = useRoute();
const { params } = route;
const product  = ref(null);

onMounted(() => {
  const query = getProduct(params.id);

  product.value = query;
})
</script>

<template>
  <p>This is Product detail page: {{ product }}</p>
</template>

<style lang="scss"></style>
