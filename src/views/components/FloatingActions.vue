<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  onUpdated,
} from 'vue';

type FloatingActions = {
  sticky?: string;
};

const props = defineProps<FloatingActions>();

const spacer          = ref<HTMLDivElement | null>(null);
const container       = ref<HTMLDivElement | null>(null);
const dialog          = computed(() => container.value?.closest('.cp-dialog'));
const measuredHeight  = ref(0);
const classes         = computed(() => ({
  'vc-floating-actions'        : true,
  'vc-floating-actions--sticky': props.sticky,
}));
let observer: IntersectionObserver | null = null;

const setHeight = () => {
  measuredHeight.value = container.value!.offsetHeight;
};

const handleVisibility = () => {
  if (container.value) {
    const refDOM  = container.value.closest(props.sticky!);
    const refRect = refDOM?.getBoundingClientRect();

    if (refRect) {
      const bottom      = window.innerHeight - Math.floor(refRect.bottom);
      const bottomStyle = window.innerHeight <= Math.floor(refRect.bottom) ? `calc(var(--safe-area-bottom) + ${bottom}px)` : `${bottom}px`;

      container.value.style.bottom  = bottomStyle;
      container.value.style.opacity = '1';
    }
  }
};

onMounted(() => {
  if (container.value && props.sticky) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setHeight();
      });
    });

    observer.observe(container.value as HTMLDivElement);

    if (dialog.value) {
      dialog.value.addEventListener('transitionend', handleVisibility);
    } else {
      handleVisibility();
    }
  }
});

onUpdated(() => {
  if (props.sticky) {
    setHeight();
    handleVisibility();
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div :class="classes">
    <div
      v-if="sticky"
      ref="spacer"
      class="vc-floating-actions__spacer"
      :style="{ height: sticky ? `calc(${measuredHeight}px)` : undefined }"
    />
    <div ref="container" class="vc-floating-actions__container">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.vc-floating-actions {
  display: contents;

  &__container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    padding: 16px;
    pointer-events: none;
    transition: opacity var(--transition-duration-normal) var(--transition-timing-function);

    &:empty {
      padding: 0;
    }

    * {
      pointer-events: auto;
    }
  }

  &__spacer {
    pointer-events: none;
  }

  &--sticky {
    .vc-floating-actions__container {
      opacity: 0;
      position: fixed;
      bottom: 0;
      z-index: var(--z-60);
    }
  }
}
</style>
