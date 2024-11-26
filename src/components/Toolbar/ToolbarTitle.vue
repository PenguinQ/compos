<script setup lang="ts"></script>

<template>
  <h2 class="cp-toolbar-title">
    <slot/>
  </h2>
</template>

<style lang="scss">
.cp-toolbar-title {
  @include text-heading-3;
  color: inherit;
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
    @include text-heading-5;
  }
}
</style>
