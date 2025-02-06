<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { Button } from '@/components';

const code = ref<HTMLDivElement | null>(null);
let timeout: ReturnType<typeof setTimeout>;

onMounted(() => {
  if (code.value) {
    timeout = setTimeout(() => {
      code.value?.setAttribute('data-loop', 'true');
    }, 1750);
  }
});

onUnmounted(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<template>
  <div class="not-found">
    <div>
      <div class="not-found__emoji">💋</div>
    </div>
    <div>
      <div class="not-found-status">
        <div ref="code" class="not-found-status__code" data-loop="false">
          <span>4</span>
          <span>0</span>
          <span>4</span>
        </div>
        <div class="not-found-status__description">You're looking for something that are not here. Go. Back.</div>
      </div>
    </div>
    <div>
      <div class="not-found__content">
        <Button color="red" @click="$router.go(-1)">Go Back</Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  --text-base-size: var(--text-size-other);

  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  flex-direction: column;

  > div {
    flex: 1 1 33.33333%;
    position: relative;

    &:nth-child(2) {
      flex: 0 0 auto;
    }
  }

  &__emoji {
    font-size: 3.5rem;
    line-height: 1;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 35%);
    opacity: 0;
    z-index: 10;
    animation-name: emoji-down;
    animation-duration: 500ms;
    animation-delay: 1750ms;
    animation-fill-mode: forwards;
  }

  &-status {
    text-align: center;
    border-top: 1px solid var(--color-black);
    border-bottom: 1px solid var(--color-black);

    &__code {
      color: var(--color-neutral-1);
      font-family: var(--text-heading-family);
      font-size: calc((56 / var(--text-base-size)) * 1rem);
      font-weight: bold;
      letter-spacing: 0.5rem;
      line-height: 1;
      text-shadow:
        1px 1px 0 var(--color-neutral-4),
        2px 2px 0 var(--color-neutral-4),
        3px 3px 0 var(--color-neutral-4),
        4px 4px 0 var(--color-neutral-4),
        5px 5px 0 var(--color-neutral-4),
        6px 6px 0 var(--color-neutral-4)
      ;
      background-color: var(--color-black);
      transform: translate3d(0, 0, 0);
      padding: 24px 0;

      span {
        display: inline-block;
        opacity: 0;
        animation-name: pulsating-scale;
        animation-duration: 750ms;
        animation-timing-function: ease-in-out;
      }

      span:nth-child(2) {
        animation-delay: 500ms;
      }

      span:nth-child(3) {
        animation-delay: 1000ms;
      }

      &[data-loop="true"] {
        span {
          animation-name: pulsating;
          animation-delay: 0ms;
          animation-duration: 1000ms;
          animation-iteration-count: infinite;
        }
      }
    }

    &__description {
      @include text-body-sm;
      background-color: var(--color-neutral-1);
      padding: 12px 16px;
    }
  }

  &__content {
    text-align: center;
    padding: 16px;
  }
}

@keyframes emoji-down {
  0% {
    opacity: 0;
    transform: translate(-50%, 35%) scale(2);
  }
  40% {
    opacity: 1;
    transform: translate(-50%, 35%) scale(1);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, 35%) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 35%) scale(1);
  }
}

@keyframes pulsating {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes pulsating-scale {
  0% {
    opacity: 0;
    transform: scale(1.2);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@supports (-webkit-touch-callout: none) and (font: -apple-system-body) {
  .not-found {
    --text-base-size: var(--text-size-apple);
  }
}

@include screen-sm {
  .not-found {
    &__emoji {
      font-size: 5rem;
    }

    &-status {
      &__code {
        font-size: calc((78 / var(--text-base-size)) * 1rem);
      }
    }
  }
}

@include screen-sm-landscape {
  .not-found {
    &__emoji {
      font-size: 3.5rem;
    }

    &-status {
      &__code {
        font-size: calc((56 / var(--text-base-size)) * 1rem);
      }
    }
  }
}
</style>
