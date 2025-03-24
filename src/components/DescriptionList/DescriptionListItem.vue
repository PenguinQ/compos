<script setup lang="ts">
import type * as CSS from 'csstype';

export type DescriptionListItem = {
  /**
   * Set the CSS align-items value of the item.
   */
  alignItems?: CSS.Property.AlignItems;
  /**
   * Set the description text of the item.
   */
  description?: string;
  /**
   * Set the title text of the item.
   */
  title?: string;
};

defineProps<DescriptionListItem>();
</script>

<template>
  <div class="cp-description-list__item" :style="{ alignItems }">
    <slot v-if="$slots.default" />
    <template v-else>
      <dt v-if="title">{{ title }}</dt>
      <dd v-if="description">{{ description }}</dd>
    </template>
  </div>
</template>

<style lang="scss">
.cp-description-list__item {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;

  dt {
    @include text-body-sm;
    color: var(--color-black);
    font-family: var(--text-heading-family);
    font-weight: 600;
    margin: 0;
  }

  dd {
    @include text-body-md;
    color: var(--color-black);
    opacity: 0.8;
    margin: 4px 0 0;
  }

  .cp-description-list--horizontal & {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;

    dt {
      line-height: var(--text-body-height-md-px);
      width: 128px;
      flex: 0 0 128px;
    }

    dd {
      flex: 1 1 auto;
      margin-top: 0;
    }
  }

  .cp-description-list--rtl & {
    direction: rtl;
  }

  .cp-description-list--compact & {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>
