<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const { params } = route;

console.log(params);
</script>

<template>
  <p>This is Product detail page: {{ params.id }}</p>
</template>

<style lang="scss"></style>
