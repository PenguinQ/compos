<script setup lang="ts">
import { useRoute } from 'vue-router';

import Button from '@components/Button';

const router = useRoute();
</script>

<template>
<Button @click="router.push('/')">Back to Home</Button>
</template>

<style lang="scss"></style>
