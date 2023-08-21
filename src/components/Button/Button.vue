<script setup lang="ts">
import { ButtonHTMLAttributes } from 'vue';
import { stateResolver } from '@helpers';

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  error?: boolean;
  full?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  error: false,
  full: false,
  loading: false,
  type: 'button',
});
</script>

<template>
  <button
    class="cp-button"
    :type="type"
    :data-cp-error="stateResolver(error)"
    :data-cp-full="stateResolver(full)"
  >
    <template v-if="loading">Loading...</template>
    <slot v-else></slot>
  </button>
</template>

<style lang="scss">
.cp-button {
  background-color: #ECECEC;
}
</style>
