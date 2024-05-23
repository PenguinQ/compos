<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

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
  sticky?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pagination: true,
  search: true,
  sticky: false,
});

defineEmits([
  'clickPaginationFirst',
  'clickPaginationPrev',
  'clickPaginationNext',
  'clickPaginationLast',
  'search',
]);

const container = ref<HTMLDivElement>();
const container_class = computed(() => ({
  'page-control': true,
  'page-control--sticky': props.sticky,
}));

const handleScroll = () => {
  if (typeof window !== 'undefined') {
    const scrollY = window.scrollY;

    console.log(scrollY);

    if (container.value) {
      if (window.scrollY > 156) {
        container.value.style.transform = `translateY(-56px)`;
      } else {
        container.value.style.transform = '';
      }
    }
  }
}

onMounted(() => {
  if (props.sticky) {
    const bound = container.value?.getBoundingClientRect();

    if (container.value) {
      container.value.style.top = `${bound!.y}px`;
    }
  }

  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div ref="container" :class="container_class">
    <Textfield
      v-if="search"
      :containerProps="{ class: 'page-control__search' }"
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
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-2);
  transition: transform var(--transition-duration-very-fast) var(--transition-timing-function);
  // padding: 8px 16px;

  &__search {
    flex-grow: 1;

    .cp-form-field {
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }

  &--sticky {
    position: sticky;
    top: 0;
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
