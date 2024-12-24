<script setup lang="ts">
import { ref } from 'vue';

export type ListTitleAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

type ListTitle = {
  as?: ListTitleAs;
};

const props = withDefaults(defineProps<ListTitle>(), {
  as: 'h4',
});

const markup = ref(props.as);
</script>

<template>
  <component :is="markup" class="cp-list-item__title">
    <slot />
  </component>
</template>

<style lang="scss">
.cp-list-item__title {
  @include text-heading-6;
  font-family: var(--text-heading-family);
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 0;
}
</style>
