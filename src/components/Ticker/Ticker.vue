<script setup lang="ts">
import { defineAsyncComponent, ref, reactive, useSlots, watch, onBeforeMount, onMounted, onUnmounted } from 'vue';
import type { TickerItemProps } from './TickerItem.vue';

type TickerItemObject = { props?: object; } & TickerItemProps;

type TickerProps = {
  activeIndex?: number;
  autoplay?: boolean;
  autoplayTimeout?: number;
  items?: TickerItemObject[];
};

const props = withDefaults(defineProps<TickerProps>(), {
  activeIndex: 0,
  autoplay: true,
  autoplayTimeout: 3000,
});

const TickerItem = defineAsyncComponent(() => import('./TickerItem.vue'));
const slots = useSlots();
const slider = ref();
const slider_index = ref(props.activeIndex);
const slider_length = ref(0);
let autoplayInterval: ReturnType<typeof setInterval>;

const tickerClass = reactive({
  'cp-ticker': true,
});

const handleNext = () => {
  if (slider_index.value === slider_length.value - 1) {
    slider_index.value = 0;
  } else {
    slider_index.value += 1;
  }
};

const endAutoplay = () => clearInterval(autoplayInterval);

const startAutoplay = () => {
  endAutoplay();
  autoplayInterval = setInterval(handleNext, props.autoplayTimeout);
};

const handleClickControl = (index: number) => {
  slider_index.value = index - 1;
};

const handleMouseEnter = () => {
  if (props.autoplay) endAutoplay();
};

const handleMouseLeave = () => {
  if (props.autoplay) startAutoplay();
};

const getSlotLength = (slots: unknown) => {
  let child_count = 0;

  (slots as []).forEach((slot) => {
    const { children, type } = slot;

    if (typeof type === 'symbol') {
      if (children && typeof children === 'object') child_count += (children as []).length;
    } else {
      child_count += 1;
    }
  });

  return child_count;
};

onBeforeMount(() => {
  if (props.items && slots.default) {
    console.error(`[Ticker] Don't use items & slot at the same time, choose either using items or slot.`)
  } else {
    if (props.items) slider_length.value = props.items.length;
    if (slots.default) slider_length.value = getSlotLength(slots.default());
  }
});

onMounted(() => {
  if (props.autoplay && slider_length.value > 1) startAutoplay();
});

onUnmounted(() => endAutoplay());

watch(
  () => props.items,
  (items) => {
    if (items) {
      slider_length.value = items.length;
      slider_index.value = items.length > 1 ? items.length - 2 : 0;

      if (props.autoplay) items.length > 1 ? startAutoplay() : endAutoplay();
    }
  },
);

if (slots.default) {
  watch(slots.default, (slot) => {
    const default_slot = getSlotLength(slot);

    slider_length.value = default_slot;
    slider_index.value = default_slot > 1 ? default_slot - 2 : 0;

    if (props.autoplay) default_slot > 1 ? startAutoplay() : endAutoplay();
  });
}
</script>

<template>
  <div :class="tickerClass" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="cp-ticker__wrapper">
      <div
        ref="slider"
        class="cp-ticker__container"
        :style="{ transform: `translate3d(-${100 * slider_index}%, 0, 0)` }"
      >
        <template v-if="items && !$slots.default">
          <component
            :is="TickerItem"
            :key="item.title"
            v-for="item in items"
            v-bind="item.props"
            :title="item.title"
            :description="item.description"
          />
        </template>
        <slot v-if="$slots.default && !items" />
      </div>
      <div v-if="slider_length > 1" class="cp-ticker-control">
        <span
          :key="n"
          v-for="n in slider_length"
          class="cp-ticker-control__item"
          :data-cp-active="slider_index === n - 1 ? true : undefined"
          @click="handleClickControl(n)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.cp-ticker {
  &__wrapper {
    border: 1px solid var(--color-black);
    border-radius: 8px;
    background-color: var(--color-white);
    overflow: hidden;
  }

  &__container {
    display: flex;
    align-items: flex-start;
    transition: transform 280ms ease;
  }

  &-control {
    display: flex;
    justify-content: center;
    gap: 4px;
    bottom: 8px;
    left: 50%;
    padding-bottom: 8px;

    &__item {
      width: 8px;
      height: 8px;
      background-color: var(--color-disabled-2);
      border-radius: 50%;
      transition: background-color 280ms ease;
      cursor: pointer;

      &[data-cp-active] {
        background-color: var(--color-black);
      }
    }
  }
}
</style>
