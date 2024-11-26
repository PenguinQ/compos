<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import type * as CSS from 'csstype';

interface Props {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'b' | 'strong' | 'p' | 'div' | 'label';
  heading?: '1' | '2' | '3' | '4' | '5' | '6' | number;
  body?: 'large' | 'medium' | 'small' | 'micro';
  color?: CSS.Property.Color;
  fontSize?: CSS.Property.FontSize;
  fontStyle?: CSS.Property.FontStyle;
  fontWeight?: CSS.Property.FontWeight;
  lineHeight?: CSS.Property.LineHeight;
  textAlign?: CSS.Property.TextAlign;
  textDecoration?: CSS.Property.TextDecoration;
  textTransform?: CSS.Property.TextTransform;
  truncate?: boolean;
  margin?: CSS.Property.Margin;
  padding?: CSS.Property.Padding;
}

const props = withDefaults(defineProps<Props>(), {
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
  color: props.color,
  fontSize: props.fontSize,
  fontStyle: props.fontStyle,
  fontWeight: props.fontWeight,
  lineHeight: props.lineHeight,
  textAlign: props.textAlign,
  textDecoration: props.textDecoration,
  textTransform: props.textTransform,
  padding: props.padding,
  margin: props.margin,
}));

watchEffect(() => {
  if (props.as) {
    markup.value = props.as;
  } else {
    if (props.heading && headingMap[props.heading]) markup.value = headingMap[props.heading];
  }
});

const textClass = computed(() => ({
  'cp-text': true,
  'cp-text--truncate': props.truncate,
  'cp-text--heading-1': props.heading == 1,
  'cp-text--heading-2': props.heading == 2,
  'cp-text--heading-3': props.heading == 3,
  'cp-text--heading-4': props.heading == 4,
  'cp-text--heading-5': props.heading == 5,
  'cp-text--heading-6': props.heading == 6,
  'cp-text--body-large': props.body === 'large',
  'cp-text--body-medium': props.body === 'medium',
  'cp-text--body-small': props.body === 'small',
  'cp-text--body-micro': props.body === 'micro',
}));
</script>

<template>
  <component :is="markup" :class="textClass" :style="textStyle">
    <slot />
  </component>
</template>

<style lang="scss">
.cp-text {
  @include text-body-md;
  color: var(--color-black);
  font-family: var(--text-body-family);
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
