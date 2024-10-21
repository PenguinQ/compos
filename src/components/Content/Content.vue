<script setup lang="ts">
import { ref, onMounted } from 'vue';

type Content = {
  fullscreen?: boolean;
};

const props = withDefaults(defineProps<Content>(), {
  fullscreen: false,
});

const contentRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const contentDOM = contentRef.value;

  if (contentDOM && props.fullscreen) {
    const previousHeader = contentDOM.previousElementSibling;
    const nextFooter = contentDOM.nextElementSibling;

    if (previousHeader && previousHeader.classList.contains('cp-toolbar')) {
      const headerRect = previousHeader.getBoundingClientRect();

      contentDOM.style.setProperty('--offset-top', `${headerRect.height}px`);
    }

    if (nextFooter && nextFooter.classList.contains('cp-footer')) {
      const footerRect = nextFooter.getBoundingClientRect();

      contentDOM.style.setProperty('--offset-bottom', `${footerRect.height}px`);
    }
  }
});
</script>

<template>
  <div ref="contentRef" class="cp-content" style="--offset-top: 0px; --offset-bottom: 0px;">
    <div class="cp-content__inner">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.cp-content {
  --padding-top: 0px;
  --padding-bottom: 0px;
  --padding-start: 0px;
  --padding-end: 0px;
  flex: 1 1 0%;
  position: relative;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 0;

  &__inner {
    overflow-y: auto;
    position: absolute;
    top: calc(var(--offset-top) * -1);
    bottom: calc(var(--offset-bottom) * -1);
    right: 0;
    left: 0;
    padding-top: calc(var(--padding-top) + var(--offset-top));
    padding-bottom: calc(var(--padding-bottom) + var(--offset-bottom));
    padding-inline-start: var(--padding-start);
    padding-inline-end: var(--padding-end);
  }
}
</style>
