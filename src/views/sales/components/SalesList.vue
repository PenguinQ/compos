<script setup lang="ts">
import { useRouter } from 'vue-router';

// Common Components
import Button from '@/components/Button';
import { Bar } from '@components/Loader';
import EmptyState from '@components/EmptyState';
import ComposIcon, { ChevronRight } from '@components/Icons';

// View Components
import ButtonBlock from '@/views/components/ButtonBlock.vue';
import Pagination from '@/views/components/Pagination.vue';
import ListSearch from '@/views/components/ListSearch.vue';
import ListFooter from '@/views/components/ListFooter.vue';
import ListFab from '@/views/components/ListFab.vue';

// Hooks
import { useSalesList } from '../hooks/SalesList.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALES_LIST } from '../constants';

type SalesListProps = {
  status: 'running' | 'finished';
};

const props = defineProps<SalesListProps>();

const router = useRouter();
const {
  data,
  isSalesEmpty,
  page,
  searchQuery,
  salesError,
  salesLoading,
  salesRefetch,
  handlePaginationPrev,
  handlePaginationNext,
  handleSearch,
  handleSearchClear,
} = useSalesList(props.status);
</script>

<template>
  <EmptyState
    v-if="salesError"
    :emoji="GLOBAL.ERROR_EMPTY_EMOJI"
    :title="GLOBAL.ERROR_EMPTY_TITLE"
    :description="GLOBAL.ERROR_EMPTY_DESCRIPTION"
    margin="56px 0"
  >
    <template #action>
      <Button @click="salesRefetch">Try Again</Button>
    </template>
  </EmptyState>
  <template v-else>
    <ListSearch
      sticky
      :placeholder="status === 'running' ? 'Search running sales' : 'Search finished sales'"
      @input="handleSearch"
      @clear="handleSearchClear"
    />
    <Bar v-if="salesLoading" margin="56px 0" />
    <template v-else>
      <EmptyState
        v-if="isSalesEmpty && searchQuery === ''"
        emoji="🍃"
        :title="status === 'running' ? SALES_LIST.RUNNING_EMPTY_TITLE : SALES_LIST.FINISHED_EMPTY_TITLE"
        :description="status === 'running' ? SALES_LIST.RUNNING_EMPTY_DESCRIPTION : SALES_LIST.FINISHED_EMPTY_DESCRIPTION"
        margin="56px 0"
      />
      <EmptyState
        v-else-if="isSalesEmpty && searchQuery !== ''"
        emoji="😵‍💫"
        :title="SALES_LIST.SEARCH_EMPTY_TITLE"
        :description="SALES_LIST.SEARCH_EMPTY_DESCRIPTION"
        margin="56px 0"
      />
      <template v-else>
        <div class="sales-items">
          <div
            :key="sales.id"
            v-for="sales in data.sales"
            class="sales-item"
          >
            <div
              class="sales-item__detail"
              role="button"
              tabindex="0"
              :aria-label="`Go to ${sales.name} detail`"
              @click="$router.push(`/sales/detail/${sales.id}`)"
            >
              <div class="sales-item__title text-truncate">{{ sales.name }}</div>
              <div class="sales-item__count">{{ sales.product_count }} Products</div>
            </div>
            <ButtonBlock
              class="sales-item__action"
              width="76px"
              height="76px"
              backgroundColor="var(--color-blue-4)"
              icon
              :aria-label="`Go to ${sales.name}`"
              @click="$router.push(`/sales/dashboard/${sales.id}`)"
            >
              <ComposIcon :icon="ChevronRight" size="28" />
            </ButtonBlock>
          </div>
        </div>
      </template>
    </template>
  </template>
  <ListFooter sticky>
    <ListFab v-if="status === 'running'" align="flex-end" @click="router.push('/sales/add')" />
    <Pagination
      v-if="!isSalesEmpty"
      frame
      :loading="salesLoading"
      :page="page.current"
      :total_page="page.total"
      :first_page="page.current <= 1"
      :last_page="page.current >= page.total"
      @clickFirst="handlePaginationPrev(true)"
      @clickPrev="handlePaginationPrev"
      @clickNext="handlePaginationNext"
      @clickLast="handlePaginationNext(true)"
    />
  </ListFooter>
</template>

<style lang="scss" scoped>
.sales-item {
  color: var(--color-black);
  background-color: var(--color-neutral-1);
  border-top: 1px solid var(--color-neutral-2);
  border-bottom: 1px solid var(--color-neutral-2);
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-top: -1px;

  &:first-of-type {
    margin-top: 0;
  }

  &__detail {
    min-width: 0;
    background-color: var(--color-white);
    flex-grow: 1;
    cursor: pointer;
    padding: 12px 16px;
    transition-property: background-color transform;
    transition-duration: var(--transition-duration-very-fast);
    transition-timing-function: var(--transition-timing-function);

    &:active {
      background-color: var(--color-neutral-1);
      transform: scale(0.98);
    }
  }

  &__title {
    font-size: 20px;
    line-height: 24px;
    margin-bottom: 8px;
  }

  &__count {
    font-size: 14px;
  }

  &__action {
    margin-top: -1px;
    margin-bottom: -1px;
  }
}
</style>
