<script setup lang="ts">
import { ref } from 'vue';

export type ListTitleAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

type ListTitleProps = {
  as?: ListTitleAs;
};

const props = withDefaults(defineProps<ListTitleProps>(), {
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
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  margin: 0;
}
</style>
