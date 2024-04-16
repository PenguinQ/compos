<script setup lang="ts">
import Navbar from '@components/Navbar';
</script>

<template>
  <Navbar v-if="!$route.meta.hideNavbar" :title="$route.meta.title" />
</template>

<style lang="scss">

</style>
