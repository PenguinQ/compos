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
  isVNode,
} from 'vue';
import type { VNode, Slot, VNodeArrayChildren } from 'vue';

import TickerItem from './TickerItem.vue';
import type { TickerItem as TickerItemProps } from './TickerItem.vue';
import type * as CSS from 'csstype';

import { instanceCounters } from '@/helpers';

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
   * Set the Ticker id.
   */
  id?: string;
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
  activeIndex: number;
  activeType: string;
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

const slots         = useSlots();
const sliderRef     = ref<HTMLDivElement | null>();
const tickerCounter = ref(instanceCounters('ticker'));
const ticker = reactive<TickerState>({
  activeIndex: 0,
  activeType : '',
  items      : [],
  length     : 0,
  types      : [],
});
const classes = computed(() => ({
  'cp-ticker'         : true,
  'cp-ticker--info'   : ticker.activeType === 'info',
  'cp-ticker--warning': ticker.activeType === 'warning',
  'cp-ticker--error'  : ticker.activeType === 'error',
}));
let autoplay_interval: ReturnType<typeof setInterval>;

const handleNext = () => {
  if (ticker.activeIndex === ticker.length - 1) {
    ticker.activeIndex = 0;
  } else {
    ticker.activeIndex += 1;
  }
};

const endAutoplay = () => clearInterval(autoplay_interval);

const startAutoplay = () => {
  endAutoplay();
  autoplay_interval = setInterval(handleNext, props.autoplayDuration);
};

const handleClickControl = (index: number) => {
  ticker.activeIndex = props.items ? index - 1 : index;
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

  if (!slots || !Array.isArray(slots)) {
    return {
      length  : 0,
      types   : [],
      children: [],
    };
  }

  slots.forEach((slot: VNode) => {
    if (!slot) return;

    const { children, type, props } = slot;

    if (typeof type === 'symbol') {
      if (children && typeof children === 'object' && Array.isArray(children)) {
        (children as VNodeArrayChildren).forEach(child => {
          if (isVNode(child)) {
            slotTypes.push(child.props?.type ? child.props.type : null);
            slotChildren.push(child);
          }
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

    ticker.activeIndex = props.activeIndex > props.items.length - 1 ? 0 : props.activeIndex;
    ticker.activeType  = types[props.activeIndex];
    ticker.length      = props.items.length;
    ticker.types       = types;
  }

  if (slots.default) {
    const { length, types, children } = getSlotDetail(slots.default());

    ticker.activeIndex = props.activeIndex > length - 1 ? 0 : props.activeIndex;
    ticker.activeType  = types[props.activeIndex];
    ticker.items       = children;
    ticker.length      = length;
    ticker.types       = types;
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

      ticker.activeIndex = props.activeIndex;
      ticker.activeType  = types[props.activeIndex];
      ticker.types       = types;
      ticker.length      = items.length;

      if (props.autoplay) items.length > 1 ? startAutoplay() : endAutoplay();
    }
  },
  { deep: true },
);

watch(
  [
    () => props.activeIndex,
    () => props.autoplay,
  ],
  (
    [index, autoplay],
    [oldIndex, oldAutoplay],
  ) => {
    if (autoplay !== oldAutoplay) {
      if (autoplay) {
        ticker.length > 1 ? startAutoplay() : endAutoplay();
      } else {
        endAutoplay();
      }
    }

    if (index !== oldIndex) {
      if (index > ticker.length - 1) {
        ticker.activeIndex = 0;
      } else {
        ticker.activeIndex = index;
      }
    }
  },
);

watch(
  [
    () => ticker.activeIndex,
    () => ticker.length,
  ],
  (
    [index, length],
    [_prevIndex, prevLength],
  ) => {
    if (length !== prevLength) {
      if (props.autoplay) ticker.length > 1 ? startAutoplay() : endAutoplay();
    }

    ticker.activeType = ticker.types[index];
  },
);

if (slots.default) {
  watch(slots.default, (slot) => {
    const { length, types, children } = getSlotDetail(slot);

    ticker.activeIndex = props.activeIndex;
    ticker.activeType  = types[props.activeIndex];
    ticker.items        = children;
    ticker.length       = length;
    ticker.types        = types;

    if (props.autoplay) length > 1 ? startAutoplay() : endAutoplay();
  });
}

const createKey = ({
  id,
  index,
  item,
  prefix,
}: {
  id?: string;
  index: number;
  item: VNode;
  prefix: string;
}) => {
  if (item.props?.id) return `${item.props.id}-${prefix}-${index}`;

  if (item.props?.key) {
    return typeof item.props.key !== 'symbol' ? `${item.props.key}-${prefix}-${index}` : item.props.key;
  }

  return id ? `${id}-${prefix}-${index}` : `${tickerCounter.value}-${prefix}-${index}`;
};
</script>

<template>
  <div
    :class="classes"
    :id="id"
    :style="{ margin }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      ref="sliderRef"
      class="cp-ticker-items"
      :style="{ transform: `translate3d(-${100 * ticker.activeIndex}%, 0, 0)` }"
    >
      <template v-if="items">
        <component
          v-for="(item, index) in items"
          :key="id ? `${id}-item-${index}` : `${tickerCounter}-item-${index}`"
          v-bind="item.props"
          :is="TickerItem"
          :title="item.title"
          :description="item.description"
          :type="item.type"
          :data-cp-active="ticker.activeIndex === index ? true : undefined"
        />
      </template>
      <template v-else-if="ticker.items.length">
        <component
          v-for="(item, index) in ticker.items"
          :key="createKey({ index, item, id, prefix: 'item' })"
          :is="item"
          :data-cp-key="createKey({ id, index, item, prefix: 'item' })"
          :data-cp-active="ticker.activeIndex === index ? true : undefined"
        />
      </template>
    </div>
    <div v-if="ticker.length > 1" class="cp-ticker-controls">
      <template v-if="items">
        <span
          v-for="index in ticker.length"
          :key="id ? `${id}-control-${index}` : `${tickerCounter}-control-${index}`"
          class="cp-ticker-control"
          role="button"
          :data-cp-active="ticker.activeIndex === index - 1 ? true : undefined"
          @click="handleClickControl(index)"
        />
      </template>
      <template v-else-if="ticker.items.length">
        <span
          v-for="(item, index) in ticker.items"
          :key="createKey({ item, id, index, prefix: 'control' })"
          class="cp-ticker-control"
          role="button"
          :data-cp-active="ticker.activeIndex === index ? true : undefined"
          @click="handleClickControl(index)"
        />
      </template>
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
