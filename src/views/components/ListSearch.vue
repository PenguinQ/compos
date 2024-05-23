<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

import Textfield from '@components/Textfield'

type ListSearchProps = {
  placeholder?: string;
  sticky?: boolean;
};

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ListSearchProps>(), {
  sticky: false,
});
const container = ref<HTMLDivElement>();
const container_class = computed(() => ({
  'list-search': true,
  'list-search--sticky': props.sticky,
}));

const handleScroll = () => {
  const DOM_container = container.value;

  if (DOM_container) {
    if (window.scrollY > 56) {
      DOM_container.style.transform = 'translateY(-56px)';
    } else {
      DOM_container.style.transform = '';
    }
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const DOM_container = container.value;

    if (props.sticky && DOM_container) {
      const bound = DOM_container.getBoundingClientRect();

      DOM_container.style.top = `${bound.y}px`;
    }

    window.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll);
  }
})
</script>

<template>
  <div ref="container" :class="container_class">
    <Textfield
      v-bind="$attrs"
      :placeholder="placeholder"
    />
  </div>
</template>

<style lang="scss">
.list-search {
  background-color: white;
  border-bottom: 1px solid var(--color-neutral-2);
  padding: 8px 16px;
  margin-bottom: 16px;
  transition: transform var(--transition-duration-very-fast) var(--transition-timing-function);

  &--sticky {
    position: sticky;
    top: 0;
    z-index: var(--z-4);
  }
}
</style>
