<script setup lang="ts">
import { computed } from 'vue';

// Common Components
import ComposIcon from '@/components/Icons';

type SaleProductDetailsItem = {
  icon: string;
  value: string | number;
  truncate?: boolean;
};

type SaleProductDetails = {
  items: SaleProductDetailsItem[];
  direction?: 'horizontal';
};

const props = defineProps<SaleProductDetails>();

/**
 * --------
 * Glossary
 * --------
 * vc  = view components
 * spd = sale product details
 */
const classes = computed(() => ({
  'vc-spd'            : true,
  'vc-spd--horizontal': props.direction === 'horizontal',
}));

const itemClass = (truncate?: boolean) => ({
  'vc-spd__item': true,
  'vc-spd__item--truncate': truncate ?? undefined,
});
</script>

<template>
  <div :class="classes">
    <div v-for="item in items" :class="itemClass(item.truncate)">
      <ComposIcon :icon="item.icon" />
      <span class="text-truncate">{{ item.value }}</span>
    </div>
  </div>
</template>

<style lang="scss">
.vc-spd {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;

  &:first-of-type {
    margin-top: 0;
  }

  &__item {
    @include text-body-sm;
    min-width: 0%;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    compos-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
  }

  &--horizontal {
    align-items: center;
    flex-direction: row;
    gap: 12px;
  }
}

@include screen-sm {
  .vc-spd {
    align-items: center;
    flex-direction: row;
    gap: 12px;
  }
}
</style>