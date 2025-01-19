<script setup lang="ts">
import type * as CSS from 'csstype';

export type DescriptionListItemProps = {
  alignItems?: CSS.Property.AlignItems;
  title?: string;
  description?: string | number;
};

defineProps<DescriptionListItemProps>();
</script>

<template>
  <div class="cp-description-list__item" :style="{ alignItems }">
    <dt :[`${$attrs.scope_id}`]="''" v-if="title">{{ title }}</dt>
    <dd :[`${$attrs.scope_id}`]="''" v-if="description">{{ description }}</dd>
    <slot />
  </div>
</template>

<style lang="scss">
$root: '.cp-description-list';

#{$root}__item {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;

  dt {
    color: var(--color-black);
    font-family: var(--text-heading-family);
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
  }

  dd {
    @include text-body-md;
    color: var(--color-black);
    opacity: 0.8;
    margin: 4px 0 0;
  }

  #{$root}--horizontal & {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;

    dt {
      @include text-body-sm;
      width: 128px;
      flex: 0 0 128px;
    }

    dd {
      flex: 1 1 auto;
      margin-top: 0;
    }
  }

  #{$root}--rtl & {
    direction: rtl;
  }

  #{$root}--compact & {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>
