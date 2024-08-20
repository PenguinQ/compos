<script setup lang="ts">
import NavbarAction from './NavbarAction.vue';
import ComposIcon, { ArrowLeftShort } from '@components/Icons';
</script>

<template>
  <NavbarAction icon>
    <ComposIcon :icon="ArrowLeftShort" size="42" />
  </NavbarAction>
</template>
