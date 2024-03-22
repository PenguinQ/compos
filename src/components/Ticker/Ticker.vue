<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  reactive,
  ref,
  useSlots,
  watch,
  onBeforeMount,
  onMounted,
  onUnmounted,
} from 'vue';
import type { VNode } from 'vue';
import type { TickerItemProps } from './TickerItem.vue';

type TickerItemObject = { props?: object } & TickerItemProps;

type TickerProps = {
  activeIndex?: number;
  autoplay?: boolean;
  autoplayTimeout?: number;
  items?: TickerItemObject[];
};

type TickerState = {
  active_index: number;
  active_type: string;
  items: VNode[];
  length: number;
  types: string[];
};

const props = withDefaults(defineProps<TickerProps>(), {
  activeIndex: 0,
  autoplay: false,
  autoplayTimeout: 5000,
});

const TickerItem = defineAsyncComponent(() => import('./TickerItem.vue'));
const slots = useSlots();
const ticker_slider = ref();

const ticker = reactive<TickerState>({
  active_index: props.activeIndex,
  active_type: '',
  items: [],
  length: 0,
  types: [],
});
const ticker_class = computed(() => ({
  'cp-ticker': true,
  'cp-ticker--info': ticker.active_type === 'info',
  'cp-ticker--warning': ticker.active_type === 'warning',
  'cp-ticker--error': ticker.active_type === 'error',
}));
let autoplay_interval: ReturnType<typeof setInterval>;

const handleNext = () => {
  if (ticker.active_index === ticker.length - 1) {
    ticker.active_index = 0;
  } else {
    ticker.active_index += 1;
  }
};

const endAutoplay = () => clearInterval(autoplay_interval);

const startAutoplay = () => {
  endAutoplay();
  autoplay_interval = setInterval(handleNext, props.autoplayTimeout);
};

const handleClickControl = (index: number) => {
  ticker.active_index = index - 1;
};

const handleMouseEnter = () => {
  if (props.autoplay) endAutoplay();
};

const handleMouseLeave = () => {
  if (props.autoplay) startAutoplay();
};

const getSlotDetail = (slots: VNode[]) => {
  let slot_types: string[] = [];
  let slot_children: VNode[] = [];

  slots.forEach((slot: VNode) => {
    const { children, type, props } = slot;

    if (typeof type === 'symbol') {
      if (children && typeof children === 'object') {
        (children as []).forEach((child: any) => {
          slot_types.push(child.props.type ? child.props.type : null);
          slot_children.push(child);
        });
      }
    } else {
      slot_types.push(props?.type ? props.type : null);
      slot_children.push(slot);
    }
  });

  return {
    length: slot_types.length,
    types: slot_types,
    children: slot_children,
  };
};

onBeforeMount(() => {
  if (props.items && slots.default) {
    console.error(`[Ticker] Don't use items & slot at the same time, choose either using items or slot.`);
  } else {
    if (props.items) ticker.length = props.items.length;
    if (slots.default) {
      const { length, types, children } = getSlotDetail(slots.default());

      ticker.length = length;
      ticker.types = types;
      ticker.items = children;
    }
  }
});

onMounted(() => {
  if (props.autoplay && ticker.length > 1) startAutoplay();
});

onUnmounted(() => endAutoplay());

watch(
  () => props.items,
  (items) => {
    if (items) {
      ticker.length = items.length;
      ticker.active_index = 0;

      if (props.autoplay) items.length > 1 ? startAutoplay() : endAutoplay();
    }
  },
  { deep: true },
);

watch(
  () => ticker.active_index,
  (index) => {
    ticker.active_type = ticker.types[index];
  },
);

if (slots.default) {
  watch(slots.default, (slot) => {
    const { length, types, children } = getSlotDetail(slot);

    ticker.length = length;
    ticker.types = types;
    ticker.items = children;
    ticker.active_index = 0;

    if (props.autoplay) length > 1 ? startAutoplay() : endAutoplay();
  });
}
</script>

<template>
  <div
    :class="ticker_class"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="cp-ticker__wrapper">
      <div
        ref="ticker_slider"
        class="cp-ticker-items"
        :style="{ transform: `translate3d(-${100 * ticker.active_index}%, 0, 0)` }"
      >
        <template v-if="items && !$slots.default">
          <component
            v-for="(item, index) in items"
            v-bind="item.props"
            :is="TickerItem"
            :key="item.title"
            :title="item.title"
            :description="item.description"
            :data-cp-active="ticker.active_index === index ? true : undefined"
          />
        </template>
        <template v-if="$slots.default && !items">
          <component
            v-for="(item, index) in ticker.items"
            :is="item"
            :key="index"
            :data-cp-active="ticker.active_index === index ? true : undefined"
          />
        </template>
      </div>
      <div v-if="ticker.length > 1" class="cp-ticker-controls">
        <span
          :key="index"
          v-for="index in ticker.length"
          class="cp-ticker-control"
          role="button"
          :data-cp-active="ticker.active_index === index - 1 ? true : undefined"
          @click="handleClickControl(index)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$root: '.cp-ticker';

.cp-ticker {
  border: 1px solid var(--color-black);
  border-radius: 8px;
  background-color: var(--color-white);
  transition: all 280ms ease;

  &--info {
    border-color: #5c9dff;
    background-color: #d6e7ff;
  }

  &--warning {
    border-color: var(--color-yellow-1);
    background-color: var(--color-yellow-5);
  }

  &--error {
    background-color: var(--color-red-3);
  }

  &__wrapper {
    overflow: hidden;
  }

  &-items {
    display: flex;
    align-items: stretch;
    transition: transform 280ms ease;
  }

  &-controls {
    display: flex;
    justify-content: center;
    gap: 4px;
    padding-bottom: 8px;
  }

  &-control {
    width: 8px;
    height: 8px;
    background-color: var(--color-disabled-2);
    border-radius: 50%;
    transition: background-color 280ms ease;
    cursor: pointer;

    &[data-cp-active] {
      background-color: var(--color-black);

      #{$root}--info & {
        background-color: white;
      }

      #{$root}--warning & {
        background-color: var(--color-yellow-1);
      }

      #{$root}--error & {
        background-color: white;
      }
    }
  }
}
</style>
