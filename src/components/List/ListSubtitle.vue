<script setup lang="ts">
import { ref } from 'vue';

export type ListSubtitleAs = 'p' | 'div';

type ListSubtitleProps = {
  as?: ListSubtitleAs;
};

const props = withDefaults(defineProps<ListSubtitleProps>(), {
  as: 'p',
});

const markup = ref(props.as);
</script>

<template>
  <component :is="markup" class="cp-list-item__subtitle">
    <slot />
  </component>
</template>

<style lang="scss">
.cp-list-item__subtitle {
  @include text-body-md;
  color: var(--color-black);
  opacity: 0.8;
  margin: 4px 0 0;
  text-overflow: ellipsis;
  overflow: hidden;
  line-clamp: 2;
}
</style>
