<script setup lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';

type IconProps = {
  name: string;
};

const props = withDefaults(defineProps<IconProps>(), {
  name: 'archive',
});

const IconComponent = defineAsyncComponent(() => import(`../icons/${props.name}.vue`));
</script>

<template>
  <IconComponent />
</template>
