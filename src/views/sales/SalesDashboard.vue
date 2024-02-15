<script setup lang="ts">
import { useRoute } from 'vue-router';

import Text from '@components/Text';

import { useSalesList } from './hooks/SalesDashboard.hook';

import Button from '@components/Button';
import { Shimmer } from '@components/Loader';
import EmptyState from '@components/EmptyState';
import PageControl from '@/views/components/PageControl.vue';

import Error from '@assets/illustration/error.svg';
import NotFound from '@assets/illustration/not_found.svg'

const {
  data,
  page,
  total_page,
  search_query,
  handleSearch,
  salesLoading,
  salesError,
  salesRefetch,
  toPrevPage,
  toNextPage,
} = useSalesList();
</script>

<template>
  <EmptyState
    v-if="salesError"
    :image="Error"
    title="Oops..."
    description="Looks like there's some thing wrong, please try again."
    margin="80px 0"
  >
    <template #action>
      <Button @click="salesRefetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <PageControl
      searchPlaceholder="Search"
      :pagination="data.sales?.length ? true : false"
      :paginationDisabled="salesLoading"
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
    <Shimmer v-if="salesLoading" class="product-shimmer" animate />
    <template v-else>
      <EmptyState
        v-if="!data.sales.length && search_query"
        :image="NotFound"
        title="No Sales Yet"
        description="Looks like there's no sales started yet, add new one!"
        margin="80px 0"
      />
      <EmptyState
        v-else-if="!data.sales.length && search_query"
        :image="NotFound"
        title="No results found..."
        description="Try other search key to find what you're looking for."
        margin="80px 0"
      />
      <template v-else>
        <pre>
          {{ data }}
        </pre>
      </template>
    </template>
    <PageControl
      :search="false"
      :pagination="data.sales?.length ? true : false"
      :paginationDisabled="salesLoading"
      :paginationPage="page"
      :paginationTotalPage="total_page"
      :paginationFirstPage="data.first_page"
      :paginationLastPage="data.last_page"
      @clickPaginationFirst="toPrevPage($event, true)"
      @clickPaginationPrev="toPrevPage"
      @clickPaginationNext="toNextPage"
      @clickPaginationLast="toNextPage($event, true)"
    />
  </template>
  <!-- <div style="height: 1500px"></div>
  <div style="width: 50px; height: 50px; background-color: coral; border-radius: 50%; position: absolute; bottom: 0; right: 0;"></div> -->
</template>

<style lang="scss" scoped></style>
