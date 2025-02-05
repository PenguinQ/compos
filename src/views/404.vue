<script setup lang="ts">
// @ts-nocheck
import { reactive, onMounted } from 'vue';

import { Button, EmptyState, Text } from '@/components';

type Spans = {
  first: string;
  second: string;
  third: string;
};

const numberMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const spans = reactive({
  first : '0',
  second: '0',
  third : '0'
});
let timer = 2000;

let firstInterval: ReturnType<typeof setInterval>;
let secondInterval: ReturnType<typeof setInterval>;
let thirdInterval: ReturnType<typeof setInterval>;

const oscilateNumber = (position: string, time = 50) => setInterval(() => {
  spans[position as keyof Spans] = numberMap[Math.floor(Math.random() * numberMap.length)];
}, time);

onMounted(() => {
  // firstInterval  = oscilateNumber('first');

  // firstInterval = setInterval(() => {
  //   spans.first = numberMap[Math.floor(Math.random() * numberMap.length)];
  //   // startTime += 100;
  // }, 50);

  // secondInterval = setInterval(() => {
  //   spans.second = numberMap[Math.floor(Math.random() * numberMap.length)];
  // }, 50);
  // thirdInterval = setInterval(() => {
  //   spans.third = numberMap[Math.floor(Math.random() * numberMap.length)];
  // }, 50);

  // setTimeout(() => {
  //   clearInterval(firstInterval);
  //   clearInterval(secondInterval);
  //   clearInterval(thirdInterval);
  // }, 2000);
});
</script>

<template>
  <div class="stripes">
    <div class="not-found">
      <span>{{ spans.first }}</span>
      <span>0</span>
      <span>4</span>
    </div>
  </div>
  <!-- <Text class="title" heading="1">404</Text> -->
  <!-- <EmptyState
    class="test"
    emoji="👻"
    title="Boo!"
    description="The page you're looking for is gone!"
    height="100%"
  >
    <template #action>
      <Button @click="$router.push('/')">Go back Home</Button>
    </template>
  </EmptyState>
  <div class="backdrop" /> -->
</template>

<style lang="scss" scoped>
.stripes {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate3d(0, -50%, 0);

  &::before {
    width: 0%;
  }
}

.curtains {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.not-found {
  width: 100%;
  // position: absolute;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
  // display: flex;
  // justify-content: center;

  span {
    font-family: var(--text-heading-family);
    font-size: calc(86 / 14 * 1rem);
    font-weight: bold;
    line-height: 100px;
    flex: 0 1 0%;
    text-align: center;
    transition: flex 300ms ease-in-out;
    text-shadow:
      1px 1px 0 var(--color-neutral-2),
      2px 2px 0 var(--color-neutral-2),
      3px 3px 0 var(--color-neutral-2),
      4px 4px 0 var(--color-neutral-2),
      5px 5px 0 var(--color-neutral-2)
    ;
    transform: translate3d(0, 0, 0);
  }
}

.title {
  font-size: calc(86 / 14 * 1rem);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* .backdrop {
  border: 999px solid var(--color-black);
  background-color: var(--color-white);
  position: absolute;
  width: 100vw;
  height: 100vw;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  // right: 0;
  // left: 0;
  // bottom: 0;
  border-radius: 9999px;
}

.test {
  z-index: 1;

  :deep() {
    > div {
      width: 320px;
      height: 320px;
      // border: inset 2px var(--color-black);
      border-radius: 50%;
      // box-shadow: 0 0 0 9999px var(--color-black);
      padding: 32px;
      justify-content: center;
      // background-color: var(--color-white);
      box-sizing: content-box;
      transition: border-width var(--transition-duration-very-fast) var(--transition-timing-function);
    }
  }
} */
</style>
