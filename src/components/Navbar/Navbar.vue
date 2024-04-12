<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

export type NavbarProps = {
  title?: string;
  sticky?: boolean;
  onBack?: () => void;
};

const props = defineProps<NavbarProps>();
const emit = defineEmits(['back']);

const NavbarBack = defineAsyncComponent(() => import('./NavbarBack.vue'));
const has_back = computed(() => !!props.onBack);
const navbar_class = computed(() => ({
  'cp-navbar': true,
  'cp-navbar--sticky': props.sticky,
}));
</script>

<template>
  <nav :class="navbar_class">
    <NavbarBack v-if="has_back" @click="$emit('back')" />
    <h2 v-if="title" class="cp-navbar__title">{{ title }}</h2>
    <slot />
  </nav>
</template>

<style lang="scss">
.cp-navbar {
  --navbar-height: 56px;

  height: var(--navbar-height);
  color: var(--color-white);
  background-color: var(--color-black);
  display: flex;
  align-items: center;
  box-shadow:
    rgba(0, 0, 0, 0.16) 0 3px 6px,
    rgba(0, 0, 0, 0.23) 0 3px 6px;

  &__title {
    color: inherit;
    font-size: var(--text-heading-3-size);
    line-height: var(--text-heading-3-height);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-top: 0;
    margin-right: 16px;
    margin-bottom: 0;

    &:first-child {
      margin-left: 16px;
    }
  }

  &-actions {
    display: flex;
    align-self: stretch;
    flex-shrink: 0;

    &:last-child {
      margin-right: -16px;
    }
  }

  &--sticky {
    position: sticky;
    top: 0;
    z-index: 50;
  }
}

@include screen-md {
  .cp-navbar {
    &__title {
      font-size: var(--text-heading-5-size);
      line-height: var(--text-heading-5-height);
    }
  }
}
</style>
