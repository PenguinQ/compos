<script setup lang="ts"></script>

<template>
  <div class="test-scope">
    Test Scope
  </div>
  <div class="test-scope">
    Test Scope
  </div>
</template>

<style lang="scss" scoped>
.test-scope {
  border: 1px solid var(--color-black);
  padding: 16px;
}
</style>
