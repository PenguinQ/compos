<script setup lang="ts">
import { ref } from 'vue';

export type ListDescriptionAs = 'p' | 'div';

type ListDescription = {
  /**
   * Render the ListDescription as another HTML tag.
   */
  as?: ListDescriptionAs;
};

const props = withDefaults(defineProps<ListDescription>(), {
  as: 'p',
});

const markup = ref(props.as);
</script>

<template>
  <component :is="markup" class="cp-list-item__description">
    <slot />
  </component>
</template>

<style lang="scss">
.cp-list-item__description {
  @include text-body-sm;
  color: var(--color-black);
  opacity: 0.8;
  margin: 4px 0 0;
  text-overflow: ellipsis;
  overflow: hidden;
  line-clamp: 2;
}
</style>
