<script setup lang="ts">
import { computed } from 'vue';
import * as CSS from 'csstype';

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
  disabled: false,
  first_page: true,
  frame: false,
  grow: false,
  last_page: true,
  loading: false,
});

defineEmits(['clickFirst', 'clickPrev', 'clickNext', 'clickLast']);

const is_loading = computed(() => props.loading);
const prev_disabled = computed(() => props.loading || props.disabled || props.first_page ? true : false);
const next_disabled = computed(() => props.loading || props.disabled || props.last_page ? true : false);
const classes = computed(() => ({
  'vc-pagination': true,
  'vc-pagination--frame': props.frame,
  'vc-pagination--grow': props.grow,
  'vc-pagination--large': props.size === 'large',
}));
</script>

<template>
  <div
    :class="classes"
    :data-cp-disabled="disabled ? true : !page && !total_page ? true : undefined"
    :style="{ alignSelf: align }"
  >
    <ButtonBlock @click="!is_loading && $emit('clickFirst')" :disabled="prev_disabled">
      <ComposIcon :icon="ChevronDoubleLeft" color="var(--color-white)" />
    </ButtonBlock>
    <ButtonBlock @click="!is_loading && $emit('clickPrev')" :disabled="prev_disabled">
      <ComposIcon :icon="ChevronLeft" color="var(--color-white)" />
    </ButtonBlock>
    <div class="vc-pagination__detail">
      <Bar v-if="is_loading" size="24px" margin="0" />
      <template v-else>
        <Text as="span" v-if="disabled || (!page && !total_page)">-</Text>
        <Text as="span" v-else>Page {{ page }} of {{ total_page }}</Text>
      </template>
    </div>
    <ButtonBlock @click="!is_loading && $emit('clickNext')" :disabled="next_disabled">
      <ComposIcon :icon="ChevronRight" color="var(--color-white)" />
    </ButtonBlock>
    <ButtonBlock @click="!is_loading && $emit('clickLast')" :disabled="next_disabled">
      <ComposIcon :icon="ChevronDoubleRight" color="var(--color-white)" />
    </ButtonBlock>
  </div>
</template>

<style lang="scss">
.vc-pagination {
  $root: &;

  display: inline-flex;
  align-items: center;
  background-color: var(--color-white);

  > .vc-button-block {
    width: 46px;
    height: 46px;
    border-radius: 0;

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
    width: 100px;
    display: flex;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
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
      background-color: var(--color-disabled-background);
      border-color: var(--color-disabled-border);
    }
  }
}
</style>
