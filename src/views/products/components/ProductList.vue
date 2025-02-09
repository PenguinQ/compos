<script setup lang="ts">
// Common Components
import {
  Bar,
  Button,
  Card,
  EmptyState,
  Label,
  Text,
} from '@/components';

// View Components
import {
  FloatingActions,
  FloatingActionButton,
  ListSearch,
  Pagination,
  ProductImage,
} from '@/views/components';

// Hooks
import { useProductList } from '../hooks/ProductList.hook';

// Constants
import GLOBAL from '@/views/constants';
import { PRODUCT_LIST } from '../constants';

// Assets
import no_image from '@/assets/illustration/no_image.svg';

type ProductListProps = {
  type: 'product' | 'bundle';
};

const props = defineProps<ProductListProps>();

const {
  list,
  page,
  searchQuery,
  isListEmpty,
  listError,
  listLoading,
  listRefetch,
  handlePaginationPrev,
  handlePaginationNext,
  handleSearch,
  handleSearchClear,
} = useProductList(props.type);
</script>

<template>
  <EmptyState
    v-if="listError"
    :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
    :title="GLOBAL.ERROR_EMPTY_TITLE"
    :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
    margin="56px 0"
  >
    <template #action>
      <Button @click="listRefetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <ListSearch
      sticky
      :placeholder="type === 'product' ? 'Search Product' : 'Search Bundle'"
      @input="handleSearch"
      @clear="handleSearchClear"
    />
    <Bar v-if="listLoading" margin="56px 0" />
    <template v-else>
      <EmptyState
        class="berak"
        v-if="isListEmpty && searchQuery === ''"
        emoji="🍃"
        :title="type === 'product' ? PRODUCT_LIST.PRODUCT_EMPTY_TITLE : PRODUCT_LIST.BUNDLE_EMPTY_TITLE"
        :description="type === 'product' ? PRODUCT_LIST.PRODUCT_EMPTY_DESCRIPTION : PRODUCT_LIST.BUNDLE_EMPTY_DESCRIPTION"
        margin="56px 0"
      />
      <EmptyState
        v-else-if="isListEmpty && searchQuery !== ''"
        emoji="😵‍💫"
        :title="PRODUCT_LIST.SEARCH_EMPTY_TITLE"
        :description="PRODUCT_LIST.SEARCH_EMPTY_DESCRIPTION"
        margin="56px 0"
      />
      <template v-else>
        <div class="products-list">
          <template v-if="type === 'product'">
            <Card class="product" :key="product.id" v-for="product in list.products" :to="`/product/${product.id}`">
              <ProductImage class="product__image">
                <img :src="product.image ? product.image : no_image" :alt="`${product.name} image`" />
              </ProductImage>
              <div class="product__detail">
                <Text class="product__title" heading="4" margin="0 0 8px" :title="product.name">
                  {{ product.name }}
                </Text>
                <Label v-if="product.variants">{{ product.variants }} variants</Label>
                <Label v-else variant="outline">No variants</Label>
              </div>
            </Card>
          </template>
          <template v-else>
            <Card class="product" :key="bundle.id" v-for="bundle in list.bundles" :to="`/bundle/${bundle.id}`">
              <ProductImage class="product__image">
                <img
                  v-if="bundle.images.length"
                  v-for="image of bundle.images"
                  :src="image ? image : no_image"
                  :alt="`${bundle.name} image`"
                />
                <img v-else :src=" no_image" :alt="`${bundle.name} image`" />
              </ProductImage>
              <div class="product__detail">
                <Text class="product__title" heading="4" margin="0 0 8px" :title="bundle.name">
                  {{ bundle.name }}
                </Text>
                <Label color="blue" v-if="bundle.count">{{ bundle.count }} products</Label>
                <Label v-else variant="outline">No product</Label>
              </div>
            </Card>
          </template>
        </div>
      </template>
    </template>
  </template>
  <FloatingActions sticky=".cp-content">
    <FloatingActionButton
      align="flex-end"
      @click="$router.push(`${type === 'product' ? '/product/add' : '/bundle/add'}`)"
    >
      {{ type === 'product' ? 'Add Product' : 'Add Bundle' }}
    </FloatingActionButton>
    <Pagination
      v-if="!isListEmpty"
      frame
      :loading="listLoading"
      :page="page.current"
      :total_page="page.total"
      :first_page="page.current <= 1"
      :last_page="page.current >= page.total"
      @clickFirst="handlePaginationPrev(true)"
      @clickPrev="handlePaginationPrev"
      @clickNext="handlePaginationNext"
      @clickLast="handlePaginationNext(true)"
    />
  </FloatingActions>
</template>

<style lang="scss" scoped>
.products-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 16px;
}

.product {
  &__image {
    width: 100%;
    height: 180px;
    border: none;
    border-radius: 0;
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

@include screen-md {
  .products-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@include screen-lg {
  .products-list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@include screen-xl {
  .products-list {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
