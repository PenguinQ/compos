<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useProductDetail } from './hooks/ProductDetail.hook';

import Navbar, { NavbarAction } from '@components/Navbar';
import Button from '@components/Button';
import EmptyState from '@components/EmptyState';
import Text from '@components/Text';
import Link from '@components/Link';
import { PencilSquare, Trash } from '@icons';

import { PRODUCT_DETAIL } from './constants';
import Error from '@assets/illustration/error.svg';

const router = useRouter();
const {
  data,
  refetch,
  isError,
  isLoading,
  deleteProduct,
  deleteProductLoading,
} = useProductDetail();
</script>

<template>
  <Navbar :title="data ? data.name : ''" sticky>
    <template v-if="!isError && !isLoading" #action>
      <NavbarAction
        backgroundColor="var(--color-blue-3)"
        @click="router.push(`/product/edit/${data.id}`)"
      >
        <PencilSquare color="#FFF" />
      </NavbarAction>
      <NavbarAction
        backgroundColor="var(--color-red-3)"
        @click="deleteProduct"
      >
        <Trash color="#FFF" />
      </NavbarAction>
    </template>
  </Navbar>
  <EmptyState
    v-if="isError"
    :image="Error"
    :title="PRODUCT_DETAIL.ERROR_TITLE"
    :description="PRODUCT_DETAIL.ERROR_DESCRIPTION"
    margin="80px 0"
  >
    <template #action>
      <Button @click="refetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <Text v-if="isLoading">Loading...</Text>
    <template v-else>
      <pre style="overflow: auto;">
        {{ data }}
      </pre>
      <img style="width: 100px; height: 100px; object-fit: contain;" v-for="image in data.image" :src="image" />
    </template>
  </template>
</template>

<style lang="scss"></style>
