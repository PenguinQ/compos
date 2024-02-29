<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { computed, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import type { AnchorHTMLAttributes } from 'vue';
import type { RouterLinkProps } from 'vue-router';
import type * as CSS from 'csstype';
import { useScopeId } from '@hooks';

interface Props extends /* @vue-ignore */ AnchorHTMLAttributes, RouterLinkProps {
  clicky?: boolean;
  margin?: CSS.Property.Margin;
  padding?: CSS.Property.Padding;
  variant?: 'outline' | 'flat';
  target?: '_self' | '_blank';
}

const props = withDefaults(defineProps<Props>(), {
  clicky: false,
  target: '_self',
  to: '',
});

const scope_id = useScopeId();
const isExternal = computed(() => typeof props.to === 'string' && props.to.startsWith('http'));
const cardClass = reactive({
  'cp-card': true,
  'cp-card--link': props.to,
  'cp-card--clicky': props.clicky,
  'cp-card--flat': props.variant === 'flat',
  'cp-card--outline': props.variant === 'outline',
});
const cardStyles = reactive({
  margin: props.margin,
  padding: props.padding,
});
</script>

<template>
  <template v-if="to">
    <a
      v-if="isExternal"
      :[scope_id]="''"
      v-bind="$attrs"
      :class="cardClass"
      :href="to as string"
      :target="target"
      :style="cardStyles"
      rel="noopener"
    >
      <slot />
    </a>
    <RouterLink v-else v-bind="$props" v-slot="{ href, navigate }" custom>
      <a
        :[scope_id]="''"
        v-bind="$attrs"
        :class="cardClass"
        :href="href"
        :target="target"
        :style="cardStyles"
        rel="noopener"
        @click="navigate"
      >
        <slot />
      </a>
    </RouterLink>
  </template>
  <div v-else :[scope_id]="''" v-bind="$attrs" :class="cardClass" :style="cardStyles">
    <slot />
  </div>
</template>

<style lang="scss">
.cp-card {
  color: var(--color-black);
  background-color: var(--color-white);
  border-radius: 8px;
  box-shadow:
    rgba(60, 64, 67, 0.3) 0 1px 2px 0,
    rgba(60, 64, 67, 0.15) 0 1px 3px 1px;
  display: block;
  overflow: hidden;

  &--clicky,
  &--link {
    cursor: pointer;
    transition-property: transform, box-shadow;
    transition-duration: var(--transition-duration-normal);
    transition-timing-function: var(--transition-timing-function);

    &:active {
      box-shadow:
        rgba(0, 0, 0, 0.16) 0 3px 6px,
        rgba(0, 0, 0, 0.23) 0 3px 6px;
      transform: scale(0.99);
    }
  }

  &--link {
    text-decoration: none;
  }

  &--flat {
    box-shadow: none;
  }

  &--outline {
    border: 1px solid var(--color-black);
    box-shadow: none;
  }
}
</style>
