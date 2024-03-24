<script setup lang="ts">
import { computed, reactive } from 'vue';
import type * as CSS from 'csstype';

import Text from '../Text';

type Props = {
  description?: string;
  height?: CSS.Property.Height;
  image?: string;
  imageAlt?: string;
  imageHeight?: CSS.Property.Height;
  imageWidth?: CSS.Property.Width;
  margin?: CSS.Property.Margin;
  orientation?: 'horizontal' | 'vertical';
  subtitle?: string;
  title: string;
  width?: CSS.Property.Width;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
});

const empty_state_class = computed(() => ({
  'cp-empty-state': true,
  'cp-empty-state--horizontal': props.orientation === 'horizontal',
}));
const empty_state_style = reactive({
  height: props.height,
  margin: props.margin,
});
const image_style = reactive({
  height: props.imageHeight,
  width: props.imageWidth,
});
</script>

<template>
  <div :class="empty_state_class" :style="empty_state_style">
    <div class="cp-empty-state__container" :style="{ width }">
      <picture v-if="image">
        <img :src="image" :alt="imageAlt ? imageAlt : 'Empty state image'" :style="image_style" />
      </picture>
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

  height: 100%;
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
