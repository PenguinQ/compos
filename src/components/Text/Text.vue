<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import type * as CSS from 'csstype';

interface Text {
  /**
   * Render Text another HTML tag, if you have `heading` or `body` property sets, it will override the rendered HTML tag.
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'b' | 'strong' | 'p' | 'div' | 'label';
  /**
   * Render the Text as heading element between h1 to h6.
   */
  heading?: '1' | '2' | '3' | '4' | '5' | '6' | number;
  /**
   * Render the Text as paragraph element with multiple sizes.
   */
  body?: 'large' | 'medium' | 'small' | 'micro';
  /**
   * Set the Text CSS color.
   */
  color?: CSS.Property.Color;
  /**
   * Set the Text CSS font-size.
   */
  fontSize?: CSS.Property.FontSize;
  /**
   * Set the Text CSS font-style.
   */
  fontStyle?: CSS.Property.FontStyle;
  /**
   * Set the Text CSS font-weight.
   */
  fontWeight?: CSS.Property.FontWeight;
  /**
   * Set the Text CSS line-height.
   */
  lineHeight?: CSS.Property.LineHeight;
  /**
   * Set the Text CSS text-align.
   */
  textAlign?: CSS.Property.TextAlign;
  /**
   * Set the Text CSS text-decoration.
   */
  textDecoration?: CSS.Property.TextDecoration;
  /**
   * Set the Text CSS text-transform.
   */
  textTransform?: CSS.Property.TextTransform;
  /**
   * Truncate Text.
   */
  truncate?: boolean;
  /**
   * Set the Text CSS margin.
   */
  margin?: CSS.Property.Margin;
  /**
   * Set the Text CSS padding.
   */
  padding?: CSS.Property.Padding;
}

const props = withDefaults(defineProps<Text>(), {
  truncate: false,
});

let markup = ref<string>('p');
const headingMap: { [key: string]: string } = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};
const textStyle = computed(() => ({
  color         : props.color,
  fontSize      : props.fontSize,
  fontStyle     : props.fontStyle,
  fontWeight    : props.fontWeight,
  lineHeight    : props.lineHeight,
  textAlign     : props.textAlign,
  textDecoration: props.textDecoration,
  textTransform : props.textTransform,
  padding       : props.padding,
  margin        : props.margin,
}));

watchEffect(() => {
  if (props.as) {
    markup.value = props.as;
  } else {
    if (props.heading && headingMap[props.heading]) markup.value = headingMap[props.heading];
  }
});

const textClass = computed(() => ({
  'cp-text'             : true,
  'cp-text--truncate'   : props.truncate,
  'cp-text--heading-1'  : props.heading == 1,
  'cp-text--heading-2'  : props.heading == 2,
  'cp-text--heading-3'  : props.heading == 3,
  'cp-text--heading-4'  : props.heading == 4,
  'cp-text--heading-5'  : props.heading == 5,
  'cp-text--heading-6'  : props.heading == 6,
  'cp-text--body-large' : props.body === 'large',
  'cp-text--body-medium': props.body === 'medium',
  'cp-text--body-small' : props.body === 'small',
  'cp-text--body-micro' : props.body === 'micro',
}));
</script>

<template>
  <component :is="markup" :class="textClass" :style="textStyle">
    <slot />
  </component>
</template>

<style lang="scss">
.cp-text {
  font-family: var(--text-body-family);
  @include text-body-md;
  font-weight: 400;
  text-decoration: none;
  margin-top: var(--margin-top, 0);
  margin-bottom: var(--margin-bottom, 12px);

  &--truncate {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

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

  &[class*="cp-text--heading"] {
    font-family: var(--text-heading-family);
    font-weight: 600;
  }

  &--heading-1 {
    @include text-heading-1;
  }

  &--heading-2 {
    @include text-heading-2;
  }

  &--heading-3 {
    @include text-heading-3;
  }

  &--heading-4 {
    @include text-heading-4;
  }

  &--heading-5 {
    @include text-heading-5;
  }

  &--heading-6 {
    @include text-heading-6;
  }
}
</style>
