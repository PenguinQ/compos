<script setup lang="ts"></script>

<template>
  <h2 class="cp-toolbar-title">
    <slot/>
  </h2>
</template>

<style lang="scss">
.cp-toolbar-title {
  color: inherit;
  font-size: var(--text-heading-3-size);
  line-height: var(--text-heading-3-height);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 0;
  margin-right: 16px;
  margin-bottom: 0;

  &:first-child {
    margin-left: 16px;
  }
}

@include screen-md {
  .cp-toolbar-title {
    font-size: var(--text-heading-5-size);
    line-height: var(--text-heading-5-height);
  }
}
</style>
