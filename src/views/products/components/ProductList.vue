<script setup lang="ts">
import { useRouter } from 'vue-router';

import Button from '@components/Button';
import Card from '@components/Card';
import Text from '@components/Text';
import Label from '@components/Label';
import { Shimmer } from '@components/Loader';
import EmptyState from '@components/EmptyState';
import PageControl from './PageControl.vue';
import { IconPlusLarge } from '@/components/icons';

import Error from '@assets/illustration/error.svg';
import NoImage from '@assets/illustration/no_image.svg';
import NotFound from '@assets/illustration/not_found.svg';

import { useProductList } from '../hooks/ProductList.hook';

const router = useRouter();
const {
  data,
  page,
  productsError,
  productsLoading,
  productsRefetch,
  toNextPage,
  toPrevPage,
  handleSearch,
} = useProductList();
</script>

<template>
  <EmptyState
    v-if="productsError"
    :image="Error"
    title="Oops..."
    description="Looks like there's some thing wrong, please try again."
    margin="80px 0"
  >
    <template #action>
      <Button @click="productsRefetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <PageControl
      searchPlaceholder="Search"
      :pagination="data?.products.length ? true : false"
      :paginationPage="page.current"
      :paginationTotalPage="page.total"
      :paginationFirstPage="page.current <= 1"
      :paginationLastPage="page.current >= page.total"
      @search="handleSearch"
      @clickPaginationFirst="toPrevPage($event, true)"
      @clickPaginationPrev="toPrevPage"
      @clickPaginationNext="toNextPage"
      @clickPaginationLast="toNextPage($event, true)"
    />
    <div v-if="productsLoading" class="product-loader">
      <Shimmer animate />
      <Shimmer animate />
      <Shimmer animate />
      <Shimmer animate />
      <Shimmer animate />
    </div>
    <EmptyState
      v-else-if="!data.products.length"
      :image="NotFound"
      title="No results found..."
      description="Try other search key to find what you're looking for."
      margin="80px 0"
    />
    <div v-else class="product-card-grid" style="position: relative;">
      <Card class="product-card" :key="product.id" v-for="product in data.products" :to="`/product/${product.id}`">
        <div class="product-card__image">
          <img :src="product.image ? product.image : NoImage" :alt="`${product.name} image`" />
        </div>
        <div class="product-card__detail">
          <Text class="product-card__title" heading="4" margin="0 0 8px" :title="product.name">
            {{ product.name }}
          </Text>
          <Label v-if="product.variant">{{ product.variant }} variants</Label>
          <Label v-else variant="outline">No variant</Label>
        </div>
      </Card>
    </div>
    <PageControl
      :search="false"
      :pagination="data?.products.length ? true : false"
      :paginationDisabled="productsLoading"
      :paginationPage="page.current"
      :paginationTotalPage="page.total"
      :paginationFirstPage="page.current <= 1"
      :paginationLastPage="page.current >= page.total"
      @clickPaginationFirst="toPrevPage($event, true)"
      @clickPaginationPrev="toPrevPage"
      @clickPaginationNext="toNextPage"
      @clickPaginationLast="toNextPage($event, true)"
    />

    <Button icon class="product-fab" @click="router.push('/product/add')">
      <IconPlusLarge />
    </Button>
  </template>
</template>

<style lang="scss" scoped>
.product-fab {
  position: fixed;
  right: 16px;
  bottom: calc(68px + 16px);
  z-index: 100;

  .cp-icon {
    fill: var(--color-white);
  }
}

.product-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  + .page-control {
    margin-top: 16px;
  }
}

.product-card {
  &__image {
    width: 100%;
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  &__detail {
    border-top: 1px solid var(--color-disabled-border);
    padding: 12px;
  }

  &__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.product-loader {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .cp-loader {
    width: 100%;
    height: 260px;
    display: block;
  }
}

@include screen-md {
  .product-card-grid,
  .product-loader {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@include screen-lg {
  .product-card-grid,
  .product-loader {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@include screen-xl {
  .product-card-grid,
  .product-loader {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
