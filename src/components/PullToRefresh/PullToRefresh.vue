<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

import { Bar } from '@/components';

import { hasClass } from '@/helpers';

type PullToRefresh = {
  minPullDistance?: number;
  maxPullDistance?: number;
};

const props = withDefaults(defineProps<PullToRefresh>(), {
  minPullDistance: 120,
  maxPullDistance: 120,
});

const emits = defineEmits(['refresh']);

const reference     = ref<HTMLElement | null>(null);
const container     = ref<HTMLDivElement | null>(null);
const pulley        = ref<HTMLDivElement | null>(null);
const indicator     = ref<HTMLDivElement | null>(null);
const isRefreshing  = ref(false);
const isReached     = ref(false)
let   startPosition = 0;
let   lastPosition  = 0;
const classes       = computed(() => ({
  'cp-refresh'            : true,
  'cp-refresh--reached'   : isReached.value,
  'cp-refresh--refreshing': isRefreshing.value,
}));

const cancel = () => {
  isRefreshing.value = false;
  isReached.value    = false;
};

const complete = () => {
  isRefreshing.value = false;
  isReached.value    = false;
};

const isPullingDown = (y: number) => lastPosition < (y - startPosition);

const isPullingUp   = (y: number) => lastPosition > (y - startPosition);

const isMinimumDistanceReached = (y: number) => (y - startPosition) >= props.minPullDistance;

const slideUp = ({
  distance = '-100%',
  duration = 120,
  element,
  onFinish,
}: {
  element: any,
  distance?: string,
  duration?: number,
  onFinish?: () => void,
}) => {
  if (!element) return;

  const animatedElement = element.animate(
    { transform: `translateY(${distance})` },
    { duration, fill: 'both' },
  );

  if (onFinish) animatedElement.onfinish = () => onFinish();
};

const handleMove = (e: MouseEvent | TouchEvent) => {
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  const yPos    = -100 + (((clientY - startPosition) * 100) / props.maxPullDistance);

  pulley.value?.style.setProperty('display', 'flex');

  if (isPullingDown(clientY)) {
    reference.value?.style.setProperty('--overflow', 'hidden');

    if (isMinimumDistanceReached(clientY)) {
      slideUp({ element: pulley.value, distance: '0%' });

      isReached.value = true;
    } else {
      slideUp({ element: pulley.value, distance: `${yPos}%` });
    }
  } else if (isPullingUp(clientY)) {
    if (!isMinimumDistanceReached(clientY)) {
      slideUp({ element: pulley.value, distance: `${yPos}%` });

      isReached.value = false;
    }
  }

  // Update last position
  lastPosition = clientY - startPosition;
};

const handleEnd = (e: MouseEvent | TouchEvent) => {
  const eventEnd  = e instanceof MouseEvent ? 'mouseup' : 'touchend';
  const eventMove = e instanceof MouseEvent ? 'mousemove' : 'touchmove';

  if (isReached.value) {
    isRefreshing.value = true;

    emits('refresh', { cancel, complete });
  }

  reference.value?.style.removeProperty('--overflow');

  slideUp({
    element: pulley.value,
    onFinish: () => {
      pulley.value?.style.removeProperty('display');
    },
  });

  reference.value?.removeEventListener(eventEnd, handleEnd);
  reference.value?.removeEventListener(eventMove, handleMove);
};

const handleStart = (e: MouseEvent | TouchEvent) => {
  const clientY   = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  const eventEnd  = e instanceof MouseEvent ? 'mouseup' : 'touchend';
  const eventMove = e instanceof MouseEvent ? 'mousemove' : 'touchmove';
  const target    = e.target as HTMLElement;
  let   parent    = target.parentElement;

  startPosition = clientY;
  lastPosition  = clientY - startPosition;

  if (reference.value?.scrollTop === 0 && !isRefreshing.value) {
    if (target !== reference.value) {
      while (parent) {
        if (hasClass('cp-content__inner', parent)) break;

        if (parent.clientHeight < parent.scrollHeight) break;

        parent = parent.parentElement;
      }
    }

    if (target === reference.value || parent === reference.value) {
      reference.value.addEventListener(eventEnd, handleEnd);
      reference.value.addEventListener(eventMove, handleMove);
    }
  }
};

onMounted(() => {
  if (container.value) {
    reference.value = container.value.parentElement?.querySelector('.cp-content__inner') as HTMLElement;

    reference.value?.addEventListener('mousedown', handleStart);
    reference.value?.addEventListener('touchstart', handleStart);
  }
});

onUnmounted(() => {
  reference.value?.removeEventListener('mousedown', handleStart);
  reference.value?.removeEventListener('touchstart', handleStart);
});

watch(isRefreshing, (refreshing) => {
  if (refreshing) {
    indicator.value?.style.setProperty('display', 'flex');
  } else {
    slideUp({
      element: indicator.value,
      onFinish: () => {
        indicator.value?.style.removeProperty('display');

        slideUp({ element: indicator.value, distance: '0%', duration: 0 });
      },
    });
  }
});

defineExpose({ cancel, complete });
</script>

<template>
  <div ref="container" :class="classes">
    <div ref="pulley" class="cp-refresh__pulley">
      {{ isReached ? 'Release to Refresh' : 'Pull to Refresh' }}
    </div>
    <div ref="indicator" class="cp-refresh__indicator">
      <Bar size="24px" color="var(--color-white)" />
    </div>
  </div>
</template>

<style lang="scss">
.cp-refresh {
  @include text-body-lg;
  font-weight: 700;
  text-align: center;
  width: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  pointer-events: none;

  &__pulley,
  &__indicator {
    height: 60px;
    color: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }

  &__pulley {
    width: 100%;
    background-color: var(--color-neutral-5);
    transform: translateY(-100%);
    display: none;
    z-index: var(--z-20);
  }

  &__indicator {
    background-color: var(--color-blue-5);
    display: none;
    z-index: var(--z-10);
  }

  &--reached {
    .cp-refresh__pulley {
      background-color: var(--color-green-5);
    }
  }
}
</style>
