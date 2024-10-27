<script setup lang="ts">
import { onMounted, computed, ref, nextTick, onUpdated } from 'vue';

type ListActionsProps = {
  sticky?: boolean;
};

const props = withDefaults(defineProps<ListActionsProps>(), {
  sticky: false,
});

const container = ref<HTMLDivElement>();
const spacer = ref<HTMLDivElement>();
const measured_height = ref(0);
const classes = computed(() => ({
  'vc-list-footer': true,
  'vc-list-footer--sticky': props.sticky,
}));

const setHeight = async () => {
  await nextTick();
  if (container.value) measured_height.value = container.value!.offsetHeight;
};

onMounted(() => {
  const DOM_container = container.value;

  if (DOM_container && props.sticky) {
    setHeight();

    const in_dialog = DOM_container.closest('.cp-dialog-body');

    if (!in_dialog) {
      const bottom_nav = document.getElementsByClassName('cp-bottom-navbar')[0];

      if (bottom_nav) {
        const bottom_nav_rect = bottom_nav.getBoundingClientRect();
        const { height } = bottom_nav_rect;

        DOM_container.style.bottom = `calc(var(--safe-area-bottom, 0) + ${height}px)`;
      }
    }
  }
});

onUpdated(() => {
  if (container.value && props.sticky) {
    if (container.value.offsetHeight !== measured_height.value) setHeight();
  }
});
</script>

<template>
  <footer :class="classes">
    <div
      ref="spacer"
      v-if="sticky"
      class="vc-list-footer__spacer"
      :style="{ height: sticky ? `calc(var(--safe-area-bottom, 0) + ${measured_height}px)` : undefined }"
    />
    <div ref="container" class="vc-list-footer__container">
      <slot />
    </div>
  </footer>
</template>

<style lang="scss">
.vc-list-footer {
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
    .vc-list-footer__container {
      position: fixed;
      bottom: 0;
      z-index: var(--z-6);
    }
  }
}
</style>
