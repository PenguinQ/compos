<script setup lang="ts">
import { useRoute } from 'vue-router';

import Text from '@components/Text';

const route = useRoute();
</script>

<template>
  <Text heading="1">Sales Dashboard Page</Text>
  <div style="height: 1500px"></div>
  <div style="width: 50px; height: 50px; background-color: coral; border-radius: 50%; position: absolute; bottom: 0; right: 0;"></div>
</template>

<style lang="scss" scoped></style>
