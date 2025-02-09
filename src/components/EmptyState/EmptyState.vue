<script setup lang="ts">
import { computed } from 'vue';
import type * as CSS from 'csstype';

import { Text } from '@/components';

type EmptyStateProps = {
  /**
   * Set the empty state description text.
   */
  description?: string;
  /**
   * Set the empty state emoji that acts like an image.
   */
  emoji?: string;
  /**
   * Set the empty state image.
   */
  image?: string;
  /**
   * Set the empty state image alt text.
   */
  imageAlt?: string;
  /**
   * Set the empty state image height.
   */
  imageHeight?: CSS.Property.Height;
  /**
   * Set the empty state image width.
   */
  imageWidth?: CSS.Property.Width;
  /**
   * Set the empty state orientation.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Set the empty state subtitle text.
   */
  subtitle?: string;
  /**
   * Set the empty state title text.
   */
  title: string;
  /**
   * Set the empty state width.
   */
  width?: CSS.Property.Width;
  /**
   * Set the empty state height.
   */
  height?: CSS.Property.Height;
  /**
   * Set the empty state padding.
   */
  padding?: CSS.Property.Padding;
  /**
   * Set the empty state margin.
   */
  margin?: CSS.Property.Margin;
};

const props = withDefaults(defineProps<EmptyStateProps>(), {
  orientation: 'vertical',
});

const empty_state_class = computed(() => ({
  'cp-empty-state': true,
  'cp-empty-state--horizontal': props.orientation === 'horizontal',
}));
</script>

<template>
  <div :class="empty_state_class" :style="{ width, height, padding, margin }">
    <div class="cp-empty-state__container" :style="{ width }">
      <picture v-if="image">
        <img :src="image" :alt="imageAlt ? imageAlt : 'Empty state image'" :style="{ width: imageWidth, height: imageHeight }" />
      </picture>
      <div v-if="emoji" class="cp-empty-state__emoji">{{ emoji }}</div>
      <div class="cp-empty-state__body">
        <Text v-if="!$slots.title" class="cp-empty-state__title" heading="2">
          {{ title }}
        </Text>
        <slot name="title" />
        <Text v-if="!$slots.subtitle && subtitle" class="cp-empty-state__subtitle" heading="4">
          {{ subtitle }}
        </Text>
        <slot name="subtitle" />
        <Text v-if="!$slots.description && description" class="cp-empty-state__description">
          {{ description }}
        </Text>
        <slot name="description" />
        <div v-if="$slots.action" class="cp-empty-state__actions">
          <slot name="action" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.cp-empty-state {
  $root: &;

  display: flex;
  align-items: center;
  justify-content: center;

  &__container {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  picture {
    img {
      display: block;
    }
  }

  &__emoji {
    font-size: 80px;
    line-height: 1;
  }

  &__body {
    width: 100%;
    text-align: center;
  }

  &__title,
  &__subtitle,
  &__description {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__actions {
    display: inline-flex;
    gap: 8px;
    margin-top: 12px;

    .cp-button {
      flex: 1 1 auto;
    }
  }

  &--horizontal {
    #{$root}__container {
      flex-direction: row;
      gap: 16px;
    }

    #{$root}__body {
      text-align: left;
    }
  }
}
</style>
