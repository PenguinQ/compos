<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { computed, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import type { AnchorHTMLAttributes } from 'vue';
import type { RouterLinkProps } from 'vue-router';
import type * as CSS from 'csstype';

/**
 * Vue only has limited Typescript support, that's why there's
 * @vue-ignore inline below to allow compiler ignore warning, see:
 *
 * https://github.com/vuejs/core/issues/8286
 */
interface Props extends /* @vue-ignore */ AnchorHTMLAttributes, RouterLinkProps {
  body?: 'large' | 'medium' | 'small' | 'micro';
  color?: CSS.Property.Color;
  fontSize?: CSS.Property.FontSize;
  fontStyle?: CSS.Property.FontStyle;
  fontWeight?: CSS.Property.FontWeight;
  lineHeight?: CSS.Property.LineHeight;
  target?: string; // re-referenced since somehow even though the attributes already defined in AnchorHTMLAttributes, it's shown warning on runtime.
  textAlign?: CSS.Property.TextAlign;
  textDecoration?: CSS.Property.TextDecoration;
  textTransform?: CSS.Property.TextTransform;
}

const props = withDefaults(defineProps<Props>(), {
  target: '_self',
});
const isExternal = computed(() => typeof props.to === 'string' && props.to.startsWith('http'));
const linkStyle = reactive({
  color: props.color,
  fontSize: props.fontSize,
  fontStyle: props.fontStyle,
  fontWeight: props.fontWeight,
  lineHeight: props.lineHeight,
  textAlign: props.textAlign,
  textDecoration: props.textDecoration,
  textTransform: props.textTransform,
});
const linkClass = computed(() => ({
  'cp-link': true,
  'cp-link--body-large': props.body === 'large',
  'cp-link--body-medium': props.body === 'medium',
  'cp-link--body-small': props.body === 'small',
  'cp-link--body-micro': props.body === 'micro',
}));
</script>

<template>
  <a
    v-if="isExternal"
    v-bind="$attrs"
    :class="linkClass"
    :href="(to as string)"
    :target="target"
    :style="linkStyle"
  >
    <slot />
  </a>
  <RouterLink v-else v-bind="$props" v-slot="{ href, navigate }" custom>
    <a
      v-bind="$attrs"
      :class="linkClass"
      :href="href"
      :target="target"
      :style="linkStyle"
      @click="navigate"
    >
      <slot />
    </a>
  </RouterLink>
</template>

<style lang="scss">
.cp-link {
  color: var(--color-green-3);
  font-family: "DM Sans", sans-serif;
  font-size: var(--text-body-medium-size);
  font-weight: 400;
  line-height: var(--text-body-medium-height);
  text-decoration: none;

  &--body-large {
    font-size: var(--text-body-large-size);
    line-height: var(--text-body-large-height);
  }

  &--body-medium {
    font-size: var(--text-body-medium-size);
    line-height: var(--text-body-medium-height);
  }

  &--body-small {
    font-size: var(--text-body-small-size);
    line-height: var(--text-body-small-height);
  }

  &--body-micro {
    font-size: var(--text-body-micro-size);
    line-height: var(--text-body-micro-height);
  }

  .cp-text & {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
  }
}
</style>
