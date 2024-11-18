<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

type Content = {
  fullscreen?: boolean;
};

const props = withDefaults(defineProps<Content>(), {
  fullscreen: false,
});
const emits = defineEmits(['scroll']);

const contentRef = ref<HTMLDivElement | null>(null);
const headerRef  = ref<HTMLElement | null>(null);
const footerRef  = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

const updateContentPadding = () => {
  const contentDOM = contentRef.value;

  if (contentDOM) {
    if (headerRef.value) {
      const rect = headerRef.value.getBoundingClientRect();

      contentDOM.style.setProperty('--offset-top', `${rect.height}px`);
    }

    if (footerRef.value) {
      const rect = footerRef.value.getBoundingClientRect();

      contentDOM.style.setProperty('--offset-bottom', `${rect.height}px`);
    }
  }
};

onMounted(() => {
  const contentDOM = contentRef.value;

  if (contentDOM && props.fullscreen) {
    const header = contentDOM.previousElementSibling;
    const footer = contentDOM.nextElementSibling;

    resizeObserver = new ResizeObserver(updateContentPadding);

    if (
      header && header.classList.contains('cp-header') ||
      header && header.classList.contains('cp-toolbar')
    ) {
      headerRef.value = header as HTMLElement;
      resizeObserver.observe(headerRef.value as HTMLElement);
    }

    if (
      footer && footer.classList.contains('cp-footer') ||
      footer && footer.classList.contains('cp-toolbar') ||
      footer && footer.classList.contains('cp-bottom-navbar')
    ) {
      footerRef.value = footer as HTMLElement;
      resizeObserver.observe(footer as HTMLElement);
    }
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

const handleScroll = (e: Event) => {
  emits('scroll', e);
};
</script>

<template>
  <div ref="contentRef" class="cp-content" style="--offset-top: 0px; --offset-bottom: 0px;">
    <div class="cp-content__inner" @scroll="handleScroll">
      <slot></slot>
    </div>
    <slot name="fixed"></slot>
  </div>
</template>

<style lang="scss">
.cp-content {
  flex: 1 1 0%;
  position: relative;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: var(--z-0);
  margin: 0;
  padding: 0;
  contain: size style;

  &__inner {
    overflow-y: var(--overflow, auto);
    position: absolute;
    top: calc(var(--offset-top) * -1);
    bottom: calc(var(--offset-bottom) * -1);
    right: 0;
    left: 0;
    padding-top: calc(var(--padding-top) + var(--offset-top));
    padding-bottom: calc(var(--padding-bottom) + var(--offset-bottom));
    padding-inline-start: var(--padding-start);
    padding-inline-end: var(--padding-end);
    overscroll-behavior-y: contain;
    touch-action: pan-x pan-y pinch-zoom;
  }
}
</style>
