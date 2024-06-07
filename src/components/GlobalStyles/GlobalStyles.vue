<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const styleContent = document.createElement('style');

  styleContent.textContent = `
    .section-card {
      border-right: none;
      border-left: none;
      border-radius: 0;
    }

    @include screen-md {
      .section-card {
        border-right: 1px solid var(--color-neutral-2);
        border-left: 1px solid var(--color-neutral-2);
        border-radius: 8px;
      }
    }
  `;

  document.head.appendChild(styleContent);
});
</script>

<template>
  <div></div>
</template>
