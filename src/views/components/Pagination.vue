<script setup lang="ts">
import { computed } from 'vue';
import type * as CSS from 'csstype';

// Common Components
import { Bar, Text } from '@/components';
import ComposIcon, { ChevronDoubleRight, ChevronDoubleLeft, ChevronLeft, ChevronRight } from '@/components/Icons';

// View Components
import ButtonBlock from './ButtonBlock.vue';

type Pagination = {
  align?: CSS.Property.AlignSelf;
  disabled?: boolean;
  first_page?: boolean;
  frame?: boolean;
  grow?: boolean;
  last_page?: boolean;
  loading?: boolean;
  page?: number;
  size?: 'large';
  total_page?: number;
};

const props = withDefaults(defineProps<Pagination>(), {
  disabled  : false,
  first_page: true,
  frame     : false,
  grow      : false,
  last_page : true,
  loading   : false,
});

defineEmits(['clickFirst', 'clickPrev', 'clickNext', 'clickLast']);

const isLoading     = computed(() => props.loading);
const prev_disabled = computed(() => props.loading || props.disabled || props.first_page ? true : false);
const next_disabled = computed(() => props.loading || props.disabled || props.last_page ? true : false);
const classes       = computed(() => ({
  'vc-pagination'       : true,
  'vc-pagination--frame': props.frame,
  'vc-pagination--grow' : props.grow,
  'vc-pagination--large': props.size === 'large',
}));
</script>

<template>
  <div
    :class="classes"
    :data-cp-disabled="disabled ? true : !page && !total_page ? true : undefined"
    :style="{ alignSelf: align }"
  >
    <ButtonBlock @click="!isLoading && $emit('clickFirst')" :disabled="prev_disabled">
      <ComposIcon :icon="ChevronDoubleLeft" color="var(--color-white)" />
    </ButtonBlock>
    <ButtonBlock @click="!isLoading && $emit('clickPrev')" :disabled="prev_disabled">
      <ComposIcon :icon="ChevronLeft" color="var(--color-white)" />
    </ButtonBlock>
    <div class="vc-pagination__detail">
      <Bar v-if="isLoading" size="24px" margin="0" />
      <template v-else>
        <Text v-if="disabled || (!page && !total_page)" as="span" truncate>-</Text>
        <Text v-else as="span" truncate>{{ page }} of {{ total_page }}</Text>
      </template>
    </div>
    <ButtonBlock @click="!isLoading && $emit('clickNext')" :disabled="next_disabled">
      <ComposIcon :icon="ChevronRight" color="var(--color-white)" />
    </ButtonBlock>
    <ButtonBlock @click="!isLoading && $emit('clickLast')" :disabled="next_disabled">
      <ComposIcon :icon="ChevronDoubleRight" color="var(--color-white)" />
    </ButtonBlock>
  </div>
</template>

<style lang="scss">
.vc-pagination {
  $root: &;

  max-width: 100%;
  display: inline-flex;
  align-items: center;
  background-color: var(--color-white);

  > .vc-button-block {
    width: 42px;
    height: 42px;
    border-radius: 0;
    flex-shrink: 0;

    compos-icon {
      width: 18px;
      height: 18px;
    }

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
    min-width: 72px;
    display: flex;
    flex-shrink: 1;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-black);
    padding: 0 8px;

    .cp-text {
      width: 100%;
      text-align: center;
      margin: 0;
    }
  }

  &--frame {
    border-radius: 12px;
    box-shadow:
      rgba(60, 64, 67, 0.3) 0px 1px 2px 0,
      rgba(60, 64, 67, 0.15) 0 1px 3px 1px;
    padding: 4px;
  }

  &--grow {
    width: 100%;

    .pagination__detail {
      flex-grow: 1;
    }
  }

  &--large {
    > .vc-button-block {
      width: 56px;
      height: 56px;

      compos-icon {
        width: 24px;
        height: 24px;
      }
    }
  }

  &[data-cp-disabled] {
    #{$root}__detail {
      background-color: var(--color-stone-2);
      border-color: var(--color-stone-3);
    }
  }
}
</style>
