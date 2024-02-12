<script setup lang="ts">
import Navbar from '@components/Navbar';
</script>

<template>
  <Navbar v-if="!$route.meta.hideNavbar" title="Product" />
</template>

<style lang="scss">

</style>
