<script setup lang="ts">
import { computed, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import type { AnchorHTMLAttributes } from 'vue';
import type { RouterLinkProps } from 'vue-router';
import type * as CSS from 'csstype';

interface Link extends /* @vue-ignore */ AnchorHTMLAttributes, RouterLinkProps {
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

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Link>(), {
  target: '_self',
});

const isExternal = computed(() => typeof props.to === 'string' && props.to.startsWith('http'));
const styles = reactive({
  color         : props.color,
  fontSize      : props.fontSize,
  fontStyle     : props.fontStyle,
  fontWeight    : props.fontWeight,
  lineHeight    : props.lineHeight,
  textAlign     : props.textAlign,
  textDecoration: props.textDecoration,
  textTransform : props.textTransform,
});
const classes = computed(() => ({
  'cp-link'             : true,
  'cp-link--body-large' : props.body === 'large',
  'cp-link--body-medium': props.body === 'medium',
  'cp-link--body-small' : props.body === 'small',
  'cp-link--body-micro' : props.body === 'micro',
}));
</script>

<template>
  <a
    v-if="isExternal"
    v-bind="$attrs"
    :class="classes"
    :href="(to as string)"
    :target="target"
    :style="styles"
  >
    <slot />
  </a>
  <RouterLink v-else v-bind="$props" v-slot="{ href, navigate }" custom>
    <a
      v-bind="$attrs"
      :class="classes"
      :href="href"
      :target="target"
      :style="styles"
      @click="navigate"
    >
      <slot />
    </a>
  </RouterLink>
</template>

<style lang="scss">
.cp-link {
  @include text-body-md;
  color: var(--color-green-3);
  font-family: "DM Sans", sans-serif;
  font-weight: 400;
  text-decoration: none;

  &--body-large {
    @include text-body-lg;
  }

  &--body-medium {
    @include text-body-md;
  }

  &--body-small {
    @include text-body-sm;
  }

  &--body-micro {
    @include text-body-xs;
  }

  .cp-text & {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
  }
}
</style>
