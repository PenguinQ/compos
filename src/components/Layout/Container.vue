<script setup lang="ts">
import { computed } from 'vue';
import type * as CSS from 'csstype';

type Container = {
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  fluid?: boolean;
  padding?: CSS.Property.Padding;
  margin?: CSS.Property.Margin;
};

const props = withDefaults(defineProps<Container>(), {
  fluid: false,
});

const classes = computed(() => ({
  'cp-container'       : true,
  'cp-container--fluid': props.fluid,
}));
</script>

<template>
  <div
    :class="classes"
    :data-cp-breakpoint="breakpoint ? breakpoint : undefined"
    :style="{ padding, margin }"
  >
    <slot />
  </div>
</template>

<style lang="scss">
.cp-container {
  &,
  &--fluid {
    width: 100%;
    padding-top: var(--padding-top, 0);
    padding-bottom: var(--padding-bottom, 0);
    padding-inline-start: var(--padding-start, 0);
    padding-inline-end: var(--padding-end, 0);
    margin-inline-start: var(--margin-start, auto);
    margin-inline-end: var(--margin-end, auto);
  }
}

@include screen-md {
  .cp-container {
    &:not([data-cp-breakpoint]):not([class*="cp-container--fluid"]) {
      max-width: 720px;
    }

    &[data-cp-breakpoint="md"] {
      max-width: 720px;
    }
  }
}

@include screen-lg {
  .cp-container {
    &:not([data-cp-breakpoint]):not([class*="cp-container--fluid"]) {
      max-width: 960px;
    }

    &[data-cp-breakpoint="lg"] {
      max-width: 960px;
    }
  }
}

@include screen-xl {
  .cp-container {
    &:not([data-cp-breakpoint]):not([class*="cp-container--fluid"]) {
      max-width: 1140px;
    }

    &[data-cp-breakpoint="xl"] {
      max-width: 1140px;
    }
  }
}

@include screen-xxl {
  .cp-container {
    &:not([data-cp-breakpoint]):not([class*="cp-container--fluid"]) {
      max-width: 1320px;
    }

    &[data-cp-breakpoint="xxl"] {
      max-width: 1320px;
    }
  }
}
</style>
