<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useProductList } from '../hooks/ProductList.hook';

import Button from '@components/Button';
import Text from '@components/Text';
import Label from '@components/Label';
import { Shimmer } from '@components/Loader';
import EmptyState from '@components/EmptyState';

import PageControl from './PageControl.vue';

import Error from '@assets/illustration/error.svg';
import NoImage from '@assets/illustration/no_image.svg'
import NotFound from '@assets/illustration/not_found.svg'

// const keep = ref(false); // For keep alive testing
const router = useRouter();
const {
  data,
  page,
  total_page,
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
      :pagination="data.products?.length ? true : false"
      :paginationDisabled="productsLoading"
      :paginationPage="page"
      :paginationTotalPage="total_page"
      :paginationFirstPage="data.first_page"
      :paginationLastPage="data.last_page"
      @search="handleSearch"
      @clickPaginationFirst="toPrevPage($event, true)"
      @clickPaginationPrev="toPrevPage"
      @clickPaginationNext="toNextPage"
      @clickPaginationLast="toNextPage($event, true)"
    />

    <Shimmer v-if="productsLoading" class="product-shimmer" animate />
    <EmptyState
      v-else-if="!data.products.length"
      :image="NotFound"
      title="No results found..."
      description="Try other search key to find what you're looking for."
      margin="80px 0"
    />
    <div v-else class="product-grid">
      <div class="product" v-for="product in data.products" @click="router.push(`/product/${product.id}`)">
          <div class="product__image">
            <img
              :src="product.image ? product.image : NoImage"
              :alt="`${product.name} image`"
              loading="lazy"
            />
          </div>
          <div class="product__detail">
            <span style="display: block; overflow: hidden;">{{ product.image64 }}</span>
            <Text
              class="product__title"
              heading="4"
              margin="0 0 8px"
              :title="product.name"
            >
              {{ product.name }}
            </Text>
            <Label v-if="product.variant">{{ product.variant }} variants</Label>
            <Label v-else variant="outline">No variant</Label>
          </div>
      </div>
    </div>

    <PageControl
      :search="false"
      :pagination="data.products?.length ? true : false"
      :paginationDisabled="productsLoading"
      :paginationPage="page"
      :paginationTotalPage="total_page"
      :paginationFirstPage="data.first_page"
      :paginationLastPage="data.last_page"
      @clickPaginationFirst="toPrevPage($event, true)"
      @clickPaginationPrev="toPrevPage"
      @clickPaginationNext="toNextPage"
      @clickPaginationLast="toNextPage($event, true)"
    />

    <!-- Should be FAB -->
    <Button @click="router.push('/product/add')">Add Product</Button>
  </template>
</template>

<style lang="scss" scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  + .page-control {
    margin-top: 16px;
  }
}

.product {
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  border-radius: 6px;
  cursor: pointer;
  display: block;
  padding: 0;
  transition: all 280ms cubic-bezier(0.63, 0.01, 0.29, 1);

  &:active {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
    transform: scale(0.98);
  }

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

.product-shimmer {
  width: calc(50% - 6px);
  height: 260px;
}

@include screen-md {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .product-shimmer {
    width: calc(33.33333% - 6px);
  }
}

@include screen-lg {
  .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .product-shimmer {
    width: calc(25% - 6px);
  }
}

@include screen-xl {
  .product-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .product-shimmer {
    width: calc(20% - 6px);
  }
}
</style>
