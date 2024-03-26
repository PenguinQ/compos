<script setup lang="ts">
export type DescriptionListItemProps = {
  title?: string;
  description?: string | number;
};

defineProps<DescriptionListItemProps>();
</script>

<template>
  <div class="cp-description-list__item">
    <dt v-if="title">{{ title }}</dt>
    <dd v-if="description">{{ description }}</dd>
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
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
  }

  dd {
    color: var(--color-black);
    font-size: var(--text-body-medium-size);
    line-height: var(--text-body-medium-height);
    opacity: 0.8;
    margin: 4px 0 0;
  }

  #{$root}--horizontal & {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;

    dt {
      width: 128px;
      font-size: var(--text-body-medium-size);
      line-height: var(--text-body-medium-height);
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
