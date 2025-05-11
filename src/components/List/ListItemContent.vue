<script setup lang="ts">
import { ref } from 'vue';

import type { ListItemSlots } from './ListItem.vue';
import type { ListTitleAs } from './ListTitle.vue';
import type { ListDescriptionAs } from './ListDescription.vue';

type ListItemContent = {
  /**
   * Set some text at the end of the ListItem.
   */
  append?: string;
  /**
   * Render the description as another HTML tag, default as `p`.
   */
  descriptionAs?: ListDescriptionAs;
  /**
   * Set the description text of the ListItem.
   */
  description?: string;
  /**
   * Set some text at the start of the ListItem.
   */
  prepend?: string;
  /**
   * Render the title as another HTML tag, default as `h4`.
   */
  titleAs?: ListTitleAs;
  /**
   * Set the title of the ListItem.
   */
  title?: string;
}

defineOptions({ inheritAttrs: false });
defineProps<ListItemContent>();
defineSlots<ListItemSlots>();

// const ListTitle       = defineAsyncComponent(() => import('./ListTitle.vue'));
// const ListDescription = defineAsyncComponent(() => import('./ListDescription.vue'));

const appendRef  = ref(null);
const prependRef = ref(null);

defineExpose({ append : appendRef, prepend: prependRef });
</script>

<template>
  Berak
  <!-- <div ref="prependRef" v-if="prepend || $slots.prepend" class="cp-list-item__prepend">
    <slot v-if="$slots.prepend" name="prepend" />
    <template v-if="prepend">{{ prepend }}</template>
  </div> -->
  <!-- <div class="cp-list-item__content">
    <ListTitle v-if="title" :as="titleAs" v-html="title" />
    <ListDescription v-if="description" :as="descriptionAs" v-html="description" />
    <slot />
  </div> -->
  <!-- <div ref="appendRef" v-if="append || $slots.append" class="cp-list-item__append">
    <slot v-if="$slots.append" name="append" />
    <template v-if="append">{{ append }}</template>
  </div> -->
</template>
