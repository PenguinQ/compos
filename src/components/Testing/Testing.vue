<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import TestingHead from './TestingHead.vue';
import TestingBody from './TestingBody.vue';

const AsyncHead = defineAsyncComponent(() => import('./TestingHead.vue'));
const AsyncBody = defineAsyncComponent(() => import('./TestingBody.vue'));
</script>

<template>
  <div>
    <!-- Loaded even it's false -->
    <TestingHead v-if="false">Head</TestingHead>

    <!-- Not Loaded until true -->
    <AsyncHead v-if="false">Async Head</AsyncHead>
    <AsyncBody v-if="false">Async Head</AsyncBody>

    <TestingBody>
      <slot />
    </TestingBody>
  </div>
</template>
