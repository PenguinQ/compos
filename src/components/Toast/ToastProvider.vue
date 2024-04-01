<script setup lang="ts">
import { provide, ref } from 'vue';
import Toast from './Toast.vue';
import { useToast } from './hooks';

// const { items, add, remove } = useToast();

const toast = ref();

const add = (props: any) => {
  toast.value.add(props)
};

provide('ToastProvider', {
  items: toast.value?.items,
  add,
});
</script>

<template>
  <slot />
  <!-- <Toast ref="toast" :items="items" @after-leave="remove" /> -->
  <Toast ref="toast" />
</template>
