<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue';

export type ToolbarProps = {
  autoHide?: boolean;
  sticky?: boolean;
  title?: string;
  onBack?: () => void;
};

const props = defineProps<ToolbarProps>();
defineEmits(['back']);

const ToolbarTitle = defineAsyncComponent(() => import('./ToolbarTitle.vue'));
const outer_container = ref<HTMLDivElement>();
const inner_container = ref<HTMLDivElement>();
const dialog = ref<Element | null>();
const toolbar_class = computed(() => ({
  'cp-toolbar': true,
  'cp-toolbar--sticky': props.sticky,
}));

const handleScroll = () => {
  const DOM_outer = outer_container.value;
  const DOM_inner = inner_container.value;
  const scrollTop = dialog.value ? dialog.value.scrollTop : window.scrollY;

  if (DOM_outer && DOM_inner) {
    if (scrollTop > DOM_inner.offsetHeight) {
      DOM_outer.style.transform = `translateY(-${DOM_inner.offsetHeight}px)`;
    } else {
      DOM_outer.style.transform = '';
    }
  }
};

onMounted(() => {
  if (typeof window !== 'undefined' && props.autoHide) {
    window.addEventListener('scroll', handleScroll);
  }

  if (outer_container.value && props.autoHide) {
    dialog.value = outer_container.value.closest('.cp-dialog-body');

    if (dialog.value) {
      dialog.value.addEventListener('scroll', handleScroll);
    }
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll);
  }

  if (dialog.value) {
    dialog.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <nav ref="outer_container" :class="toolbar_class">
    <div ref="inner_container" class="cp-toolbar__main">
      <ToolbarTitle v-if="title" class="cp-toolbar-title">{{ title }}</ToolbarTitle>
      <slot />
    </div>
    <div class="cp-toolbar__extension" v-if="$slots.extension">
      <slot name="extension"></slot>
    </div>
  </nav>
</template>

<style lang="scss">
.cp-toolbar {
  --toolbar-height: 56px;
  min-height: var(--toolbar-height);
  background-color: var(--color-black);
  box-shadow:
    rgba(0, 0, 0, 0.16) 0 3px 6px,
    rgba(0, 0, 0, 0.23) 0 3px 6px;
  transition: transform var(--transition-duration-very-fast) var(--transition-timing-function);

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
    z-index: var(--z-1);
  }

  &__main {
    height: var(--toolbar-height);
    color: var(--color-white);
    display: flex;
    align-items: center;
  }
}
</style>
