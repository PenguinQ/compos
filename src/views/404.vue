<script setup lang="ts">
import { useRouter } from 'vue-router';

import { Button } from '@/components';

const router = useRouter();
</script>

<template>
<Button @click="router.push('/')">Back to Home</Button>
</template>

<style lang="scss"></style>
