<script setup lang="ts">
import { useRouter } from 'vue-router';

import Button from '@components/Button';
import Text from '@components/Text';
import Label from '@components/Label';
import { Shimmer } from '@components/Loader';
import EmptyState from '@components/EmptyState';
import PageControl from './PageControl.vue';

import Error from '@assets/illustration/error.svg';
import NoImage from '@assets/illustration/no_image.svg'
import NotFound from '@assets/illustration/not_found.svg'

import { useBundle } from '../hooks/BundleList.hook';

const router = useRouter();
const {
  data,
  page,
  bundlesError,
  bundlesLoading,
  bundlesRefetch,
  toNextPage,
  toPrevPage,
  handleSearch,
} = useBundle();
</script>

<template>
  <EmptyState
    v-if="bundlesError"
    :image="Error"
    title="Oops..."
    description="Looks like there's some thing wrong, please try again."
    margin="80px 0"
  >
    <template #action>
      <Button @click="bundlesRefetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <PageControl
      searchPlaceholder="Search"
      :pagination="data?.bundles.length ? true : false"
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
    <div v-if="bundlesLoading" class="product-loader">
      <Shimmer animate />
      <Shimmer animate />
      <Shimmer animate />
      <Shimmer animate />
      <Shimmer animate />
    </div>
    <EmptyState
      v-else-if="!data.bundles.length"
      :image="NotFound"
      title="No results found..."
      description="Try other search key to find what you're looking for."
      margin="80px 0"
    />
    <div v-else class="product-grid">
      <div class="product" v-for="bundle in data.bundles" @click="router.push(`/product/bundle/${bundle.id}`)">
        <div class="product__image">
          <template v-if="bundle.image.length">
            <img v-for="(image, index) of bundle.image" :src="image ? image : NoImage" :alt="`${bundle.name} image ${index + 1}`" />
          </template>
          <img v-else :src=" NoImage" :alt="`${bundle.name} image`" />
        </div>
        <div class="product__detail">
          <Text
            class="product__title"
            heading="4"
            margin="0 0 8px"
            :title="bundle.name"
          >
            {{ bundle.name }}
          </Text>
          <Label color="blue" v-if="bundle.count">{{ bundle.count }} products</Label>
          <Label v-else variant="outline">No product</Label>
        </div>
      </div>
    </div>
    <PageControl
      :search="false"
      :pagination="data?.bundles.length ? true : false"
      :paginationPage="page.current"
      :paginationTotalPage="page.total"
      :paginationFirstPage="page.current <= 1"
      :paginationLastPage="page.current >= page.total"
      @clickPaginationFirst="toPrevPage($event, true)"
      @clickPaginationPrev="toPrevPage"
      @clickPaginationNext="toNextPage"
      @clickPaginationLast="toNextPage($event, true)"
    />
  </template>
</template>

<style lang="scss" scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
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
    display: grid;
    grid-template-columns: repeat(2, 1fr);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;

      &:only-child {
        grid-column: span 2;
      }
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
  .product-grid,
  .product-loader {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@include screen-lg {
  .product-grid,
  .product-loader {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@include screen-xl {
  .product-grid,
  .product-loader {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
