<script setup lang="ts">
import { computed, ref } from 'vue';
import * as CSS from 'csstype';

type ListActionsProps = {
  height?: CSS.Property.Height;
  sticky?: boolean;
};

const props = withDefaults(defineProps<ListActionsProps>(), {
  sticky: false,
});

const container = ref<HTMLDivElement>();
const spacer = ref<HTMLDivElement>();
const classes = computed(() => ({
  'list-footer': true,
  'list-footer--sticky': props.sticky,
}));
</script>

<template>
  <footer :class="classes">
    <div ref="spacer" v-if="sticky" class="list-footer__spacer" :style="{ height: sticky ? height : undefined }" />
    <div ref="container" class="list-footer__container">
      <slot />
    </div>
  </footer>
</template>

<style lang="scss">
.list-footer {
  display: contents;

  &__container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    padding: 16px;
    pointer-events: none;

    * {
      pointer-events: auto;
    }
  }

  &__spacer {
    pointer-events: none;
  }

  &--sticky {
    .list-footer__container {
      position: fixed;
      bottom: var(--bottom-nav-height);
    }
  }
}
</style>
