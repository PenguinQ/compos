<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  onUpdated,
} from 'vue';
import type { UnwrapRef } from 'vue';

type FloatingActions = {
  spacedElement?: UnwrapRef<HTMLElement> | string | null;
  sticky?: string;
};

const props = defineProps<FloatingActions>();

const container      = ref<HTMLDivElement | null>(null);
const dialog         = computed(() => container.value?.closest('.cp-dialog'));
const measuredHeight = ref(0);
const classes = computed(() => ({
  'vc-floating-actions'        : true,
  'vc-floating-actions--sticky': props.sticky,
}));
let observer: IntersectionObserver | null = null;

const handleVisibility = () => {
  if (container.value) {
    const refDOM   = container.value.closest(props.sticky!);
    const refRect  = refDOM?.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();

    if (refRect) {
      const bottom      = bodyRect.height - Math.floor(refRect.bottom);
      const bottomStyle = bodyRect.height <= Math.floor(refRect.bottom) ? `calc(var(--safe-area-bottom) + ${bottom}px)` : `${bottom}px`;

      container.value.style.bottom  = bottomStyle;
      container.value.style.opacity = '1';
    }
  }
};

onMounted(() => {
  if (container.value && props.sticky) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const containerRect = container.value!.getBoundingClientRect();

          measuredHeight.value = containerRect.height;
        };
      });
    });

    observer.observe(container.value as HTMLDivElement);

    handleVisibility();

    if (dialog.value) dialog.value.addEventListener('transitionend', handleVisibility);
  }
});

onUpdated(() => {
  if (props.sticky && container.value) {
    const containerRect = container.value.getBoundingClientRect();

    measuredHeight.value = containerRect.height;

    if (props.spacedElement) {
      if (typeof props.spacedElement === 'string') {
        const reference = document.querySelector(props.spacedElement) as HTMLElement;

        if (reference) reference.style.paddingBottom = `${measuredHeight.value}px`;
      } else {
        props.spacedElement.style.paddingBottom = `${measuredHeight.value}px`;
      }
    }
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

defineExpose({ height: measuredHeight, container });
</script>

<template>
  <div ref="container" :class="classes">
    <slot />
  </div>
</template>

<style lang="scss">
.vc-floating-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 16px;
  transition: opacity var(--transition-duration-normal) var(--transition-timing-function);
  pointer-events: none;

  &:empty {
    padding: 0;
  }

  * {
    pointer-events: auto;
  }

  &--sticky {
    opacity: 0;
    position: fixed;
    bottom: 0;
    z-index: var(--z-60);
  }
}
</style>
