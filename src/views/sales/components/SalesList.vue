<script setup lang="ts">
import Button from '@/components/Button';
import { Shimmer } from '@components/Loader';
import EmptyState from '@components/EmptyState';
import PageControl from '@/views/components/PageControl.vue';

import Error from '@assets/illustration/error.svg';
import NotFound from '@assets/illustration/not_found.svg'

import { useSalesList } from '../hooks/SalesDashboard.hook';
import { EMPTY_STATE_RUNNING, EMPTY_STATE_FINISHED } from '../constants';

type Props = {
  status: 'running' | 'finished';
};

const props = defineProps<Props>();

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
} = useSalesList(props.status);
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
        v-if="!data.sales.length"
        :image="NotFound"
        :title="props.status === 'running' ? EMPTY_STATE_RUNNING.EMPTY_TITLE : EMPTY_STATE_FINISHED.EMPTY_TITLE"
        :description="props.status === 'running' ? EMPTY_STATE_RUNNING.EMPTY_DESCRIPTION : EMPTY_STATE_FINISHED.EMPTY_DESCRIPTION"
        margin="80px 0"
      />
      <EmptyState
        v-else-if="!data.sales.length && search_query"
        :image="NotFound"
        :title="props.status === 'running' ? EMPTY_STATE_RUNNING.SEARCH_EMPTY_TITLE : EMPTY_STATE_FINISHED.SEARCH_EMPTY_TITLE"
        :description="props.status === 'running' ? EMPTY_STATE_RUNNING.SEARCH_EMPTY_DESCRIPTION : EMPTY_STATE_FINISHED.SEARCH_EMPTY_DESCRIPTION"
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
</template>

<style lang="scss" scoped></style>
