<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';

import Button from '@components/Button';
import Text from '@components/Text';
import Link from '@components/Link';

import { useProductDetail } from './hooks/ProductDetail.hook';

const route = useRoute();
const { params } = route;
const {
  data,
  refetch,
  isLoading,
  isError,
  isSuccess,
} = useProductDetail();
</script>

<template>
  <Text heading="4">This is Product detail page</Text>
  <div v-if="isLoading">Loading... {{ isLoading }}</div>
  <div v-else>
    <Button @click="refetch">Refetch</Button>
    <div>Name: {{ data.name }}</div>
    <div>Description{{ data.description }}</div>
    <div>Image Path: {{ data.image }}</div>
    <div>By: {{ data.by }}</div>
    <div>Price: {{ data.price }}</div>
    <div>Stock: {{ data.stock }}</div>
    <div>Created At: {{ data.created_at }}</div>
    <div>Updated At: {{ data.updated_at }}</div>
    <div style="margin-top: 12px;">
      <Link :to="`/product/edit/${data.id}`">Edit {{ data.name }}</Link>
    </div>
  </div>
</template>

<style lang="scss"></style>
