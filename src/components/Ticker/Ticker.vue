<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
  useSlots,
  watch,
  onBeforeMount,
  onMounted,
  onUnmounted,
} from 'vue';
import type { VNode, Slot } from 'vue';

import TickerItem from './TickerItem.vue';
import type { TickerItem as TickerItemProps } from './TickerItem.vue';
import type * as CSS from 'csstype';

type TickerItem = { props?: object } & TickerItemProps;

type Ticker = {
  /**
   * Set the current or starting active slide.
   */
  activeIndex?: number;
  /**
   * Set the Ticker to autoplay.
   */
  autoplay?: boolean;
  /**
   * Set the Ticker autoplay duration.
   */
  autoplayDuration?: number;
  /**
   * Set the item for each Ticker.
   */
  items?: TickerItem[];
  /**
   * Set the margin for the Ticker.
   */
  margin?: CSS.Property.Margin;
};

type TickerState = {
  active_index: number;
  active_type: string;
  items: VNode[];
  length: number;
  types: string[];
};

type TickerSlots = {
  default?: Slot;
};

const props = withDefaults(defineProps<Ticker>(), {
  activeIndex     : 0,
  autoplay        : false,
  autoplayDuration: 5000,
});

defineSlots<TickerSlots>();

const slots     = useSlots();
const sliderRef = ref<HTMLDivElement | null>();
const ticker = reactive<TickerState>({
  active_index: 0,
  active_type : '',
  items       : [],
  length      : 0,
  types       : [],
});
const classes = computed(() => ({
  'cp-ticker'         : true,
  'cp-ticker--info'   : ticker.active_type === 'info',
  'cp-ticker--warning': ticker.active_type === 'warning',
  'cp-ticker--error'  : ticker.active_type === 'error',
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
  autoplay_interval = setInterval(handleNext, props.autoplayDuration);
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

const getItemTypes = (items: TickerItem[]) => {
  return items.reduce((types: string[], item: TickerItem) => {
    types.push(item.type ? item.type : '');

    return types;
  }, []);
};

const getSlotDetail = (slots: VNode[]) => {
  let slotTypes: string[]   = [];
  let slotChildren: VNode[] = [];

  slots.forEach((slot: VNode) => {
    const { children, type, props } = slot;

    if (typeof type === 'symbol') {
      if (children && typeof children === 'object') {
        (children as []).forEach((child: VNode) => {
          slotTypes.push(child.props?.type ? child.props.type : null);
          slotChildren.push(child);
        });
      }
    } else {
      slotTypes.push(props?.type ? props.type : null);
      slotChildren.push(slot);
    }
  });

  return {
    length  : slotTypes.length,
    types   : slotTypes,
    children: slotChildren,
  };
};

onBeforeMount(() => {
  if (props.items) {
    const types = getItemTypes(props.items);

    ticker.active_index = props.activeIndex > props.items.length - 1 ? 0 : props.activeIndex;
    ticker.active_type  = types[props.activeIndex];
    ticker.length       = props.items.length;
    ticker.types        = types;
  }

  if (slots.default) {
    const { length, types, children } = getSlotDetail(slots.default());

    ticker.active_index = props.activeIndex > length - 1 ? 0 : props.activeIndex;
    ticker.active_type  = types[props.activeIndex];
    ticker.items        = children;
    ticker.length       = length;
    ticker.types        = types;
  }
});

onMounted(() => {
  if (props.autoplay) {
    ticker.length > 1 ? startAutoplay() : endAutoplay();
  } else {
    endAutoplay();
  }
});

onUnmounted(() => endAutoplay());

watch(
  () => props.items,
  (items) => {
    if (items) {
      const types = getItemTypes(items);

      ticker.active_index = props.activeIndex;
      ticker.active_type  = types[props.activeIndex];
      ticker.types        = types;
      ticker.length       = items.length;

      if (props.autoplay) items.length > 1 ? startAutoplay() : endAutoplay();
    }
  },
  { deep: true },
);

watch(
  [() => props.activeIndex, () => props.autoplay],
  ([index, autoplay], [old_index, _old_autoplay]) => {
    if (autoplay !== _old_autoplay) {
      if (autoplay) {
        ticker.length > 1 ? startAutoplay() : endAutoplay();
      } else {
        endAutoplay();
      }
    }

    if (index !== old_index) {
      if (index > ticker.length - 1) {
        ticker.active_index = 0;
      } else {
        ticker.active_index = index;
      }
    }
  },
);

watch(
  [() => ticker.active_index, () => ticker.length],
  ([index, length], [_prev_index, prev_length]) => {
    if (length !== prev_length) {
      if (props.autoplay) ticker.length > 1 ? startAutoplay() : endAutoplay();
    }

    ticker.active_type = ticker.types[index];
  },
);

if (slots.default) {
  watch(slots.default, (slot) => {
    const { length, types, children } = getSlotDetail(slot);

    ticker.active_index = props.activeIndex;
    ticker.active_type  = types[props.activeIndex];
    ticker.items        = children;
    ticker.length       = length;
    ticker.types        = types;

    if (props.autoplay) length > 1 ? startAutoplay() : endAutoplay();
  });
}
</script>

<template>
  <div :class="classes" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" :style="{ margin }">
    <div
      ref="sliderRef"
      class="cp-ticker-items"
      :style="{ transform: `translate3d(-${100 * ticker.active_index}%, 0, 0)` }"
    >
      <template v-if="items">
        <component
          v-for="(item, index) in items"
          v-bind="item.props"
          :is="TickerItem"
          :key="item.title"
          :title="item.title"
          :description="item.description"
          :type="item.type"
          :data-cp-active="ticker.active_index === index ? true : undefined"
        />
      </template>
      <template v-if="$slots.default">
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
</template>

<style lang="scss">
.cp-ticker {
  border: 1px solid var(--color-neutral-4);
  border-radius: 8px;
  background-color: var(--color-neutral-1);
  overflow: hidden;
  transition: all var(--transition-duration-normal) var(--transition-timing-function);

  &--error {
    border-color: var(--color-red-4);
    background-color: var(--color-red-1);
  }

  &--info {
    border-color: var(--color-blue-4);
    background-color: var(--color-blue-1);
  }

  &--warning {
    border-color: var(--color-yellow-4);
    background-color: var(--color-yellow-1);
  }

  &__wrapper {
    overflow: hidden;
  }

  &-items {
    display: flex;
    align-items: stretch;
    transition: transform var(--transition-duration-normal) var(--transition-timing-function);
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
    background-color: var(--color-neutral-4);
    border-radius: 50%;
    transition: background-color var(--transition-duration-normal) var(--transition-timing-function);
    cursor: pointer;

    &[data-cp-active] {
      background-color: var(--color-neutral-7);

      .cp-ticker--error & {
        background-color: var(--color-red-4);
      }

      .cp-ticker--info & {
        background-color: var(--color-blue-4);
      }

      .cp-ticker--warning & {
        background-color: var(--color-yellow-4);
      }
    }
  }
}
</style>
