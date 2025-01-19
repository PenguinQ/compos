<script setup lang="ts">
// Common Components
import { Bar, Button, EmptyState } from '@/components';
import ComposIcon, { LayoutSidebarReverse } from '@/components/Icons';

// View Components
import {
  ButtonBlock,
  FloatingActions,
  FloatingActionButton,
  ListSearch,
  Pagination,
} from '@/views/components';

// Hooks
import { useSaleList } from '../hooks/SaleList.hook';

// Constants
import GLOBAL from '@/views/constants';
import { SALE_LIST } from '../constants';

type SalesListProps = {
  status: 'running' | 'finished';
};

const props = defineProps<SalesListProps>();

const {
  list,
  isListEmpty,
  page,
  searchQuery,
  listError,
  listLoading,
  listRefetch,
  handlePaginationPrev,
  handlePaginationNext,
  handleSearch,
  handleSearchClear,
} = useSaleList(props.status);
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
      :placeholder="status === 'running' ? 'Search running sales' : 'Search finished sales'"
      @input="handleSearch"
      @clear="handleSearchClear"
    />
    <Bar v-if="listLoading" margin="56px 0" />
    <template v-else>
      <EmptyState
        v-if="isListEmpty && searchQuery === ''"
        emoji="🍃"
        :title="status === 'running' ? SALE_LIST.RUNNING_EMPTY_TITLE : SALE_LIST.FINISHED_EMPTY_TITLE"
        :description="status === 'running' ? SALE_LIST.RUNNING_EMPTY_DESCRIPTION : SALE_LIST.FINISHED_EMPTY_DESCRIPTION"
        margin="56px 0"
      />
      <EmptyState
        v-else-if="isListEmpty && searchQuery !== ''"
        emoji="😵‍💫"
        :title="SALE_LIST.SEARCH_EMPTY_TITLE"
        :description="SALE_LIST.SEARCH_EMPTY_DESCRIPTION"
        margin="56px 0"
      />
      <template v-else>
        <div class="sales-list">
          <div
            :key="sales.id"
            v-for="sales in list.sales"
            class="sale"
          >
            <div
              class="sale__detail"
              role="button"
              tabindex="0"
              :aria-label="`Go to ${sales.name} detail`"
              @click="$router.push(`/sale/detail/${sales.id}`)"
            >
              <div class="sale__title text-truncate">{{ sales.name }}</div>
              <div class="sale__count">{{ sales.product_count }} Products</div>
            </div>
            <ButtonBlock
              v-if="status === 'running'"
              class="sale__action"
              width="76px"
              height="76px"
              backgroundColor="var(--color-blue-4)"
              icon
              :aria-label="`Go to ${sales.name}`"
              @click="$router.push(`/sale/dashboard/${sales.id}`)"
            >
              <ComposIcon :icon="LayoutSidebarReverse" size="28" />
            </ButtonBlock>
          </div>
        </div>
      </template>
    </template>
  </template>
  <FloatingActions sticky=".cp-content">
    <FloatingActionButton
      v-if="status === 'running'"
      align="flex-end"
      @click="$router.push('/sale/add')"
    >
      Add Sale
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
.sale {
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;
    flex-grow: 1;
    cursor: pointer;
    user-select: none;
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
    font-family: var(--text-heading-family);
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    margin-bottom: 4px;
  }

  &__count {
    @include text-body-sm;
    // font-size: var(--text-body-size-sm);
  }

  &__action {
    margin-top: -1px;
    margin-bottom: -1px;
  }
}
</style>
