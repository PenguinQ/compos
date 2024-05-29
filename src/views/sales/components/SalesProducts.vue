<script setup lang="ts"></script>

<template>
  <div class="sales-products">
    <slot />
  </div>
</template>

<style lang="scss">
.sales-products {
  margin-top: -1px;

  &:first-of-type {
    .sales-product:first-of-type {
      border-top-color: transparent;
    }
  }
}
</style>
