<script setup lang="ts">
import Button from '@components/Button';
import Text from '@components/Text';
import {
  ChevronDoubleRight,
  ChevronDoubleLeft,
  ChevronLeft,
  ChevronRight,
} from '@icons';

type Props = {
  disabled?: boolean;
  first_page?: boolean;
  last_page?: boolean;
  page?: number,
  total_page?: number,
};

withDefaults(defineProps<Props>(), {
  disabled: false,
  first_page: true,
  last_page: true,
});

defineEmits([
  'clickFirst',
  'clickPrev',
  'clickNext',
  'clickLast',
]);
</script>

<template>
  <div
    class="pagination"
    :data-cp-disabled="disabled ? true : !page && !total_page ? true : undefined"
  >
    <Button
      @click="$emit('clickFirst')"
      :disabled="disabled ? true : first_page ? true : false"
    >
      <ChevronDoubleLeft size="18" color="var(--color-white)" />
    </Button>
    <Button
      @click="$emit('clickPrev')"
      :disabled="disabled ? true : first_page ? true : false"
    >
      <ChevronLeft size="18" color="var(--color-white)" />
    </Button>
    <div class="pagination__detail">
      <Text v-if="disabled || !page && !total_page">-</Text>
      <Text v-else>Page {{ page }} of {{ total_page }}</Text>
    </div>
    <Button
      @click="$emit('clickNext')"
      :disabled="disabled ? true : last_page ? true : false"
    >
      <ChevronRight size="18" color="var(--color-white)" />
    </Button>
    <Button
      @click="$emit('clickLast')"
      :disabled="disabled ? true : last_page ? true : false"
    >
      <ChevronDoubleRight size="18" color="var(--color-white)" />
    </Button>
  </div>
</template>

<style lang="scss">
.pagination {
  $root: &;

  display: inline-flex;
  align-items: center;

  > .cp-button {
    border-radius: 0;
    margin-right: -1px;

    &:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }

    &:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    &:active {
      transform: none;
    }
  }

  &__detail {
    width: 100px;
    display: flex;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid var(--color-black);
    padding: 4px 8px;

    .cp-text {
      width: 100%;
      text-align: center;
      margin: 0;
    }

    + .cp-button {
      margin-right: 0;
    }
  }

  &[data-cp-disabled] {
    #{$root}__detail {
      background-color: var(--color-disabled-background);
      border-color: var(--color-disabled-border);
    }
  }
}
</style>
