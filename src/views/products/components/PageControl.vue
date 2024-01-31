<script setup lang="ts">
import Textfield from '@components/Textfield';
import Pagination from './Pagination.vue';

type Props = {
  pagination?: boolean;
  paginationDisabled?: boolean;
  paginationPage?: number;
  paginationTotalPage?: number;
  paginationFirstPage?: boolean;
  paginationLastPage?: boolean;
  search?: boolean;
  searchPlaceholder?: string;
}

withDefaults(defineProps<Props>(), {
  pagination: true,
  search: true,
});

defineEmits([
  'clickPaginationFirst',
  'clickPaginationPrev',
  'clickPaginationNext',
  'clickPaginationLast',
  'search',
]);
</script>

<template>
  <div class="page-control">
    <Textfield
      v-if="search"
      class="page-control__search"
      :placeholder="searchPlaceholder"
      @input="$emit('search', $event)"
    />
    <Pagination
      v-if="pagination"
      class="page-control__pagination"
      :disabled="paginationDisabled"
      :page="paginationPage"
      :total_page="paginationTotalPage"
      :first_page="paginationFirstPage"
      :last_page="paginationLastPage"
      @clickFirst="$emit('clickPaginationFirst')"
      @clickPrev="$emit('clickPaginationPrev')"
      @clickNext="$emit('clickPaginationNext')"
      @clickLast="$emit('clickPaginationLast')"
    />
  </div>
</template>

<style lang="scss">
.page-control {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;

  &__search {
    width: 100%;
  }
}

@include screen-md {
  .page-control {
    flex-direction: row;
    justify-content: space-between;

    &__search {
      max-width: 320px;
    }

    &__pagination {
      margin-left: auto;
    }
  }
}
</style>
