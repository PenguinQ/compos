<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';
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
  margin?: CSS.Property.Margin | number;
  padding?: CSS.Property.Padding | number;
}

const props = defineProps<Props>();

let markup = ref<string>('p');
const headingMap: { [key: string]: string } = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};
const textStyle = reactive({
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
});

onBeforeMount(() => {
  const { as, heading } = props;

  if (as) {
    markup.value = as;
  } else {
    if (heading && headingMap[heading]) markup.value = headingMap[heading];
  }
});
</script>

<template>
  <component
    class="cp-text"
    :is="markup"
    :data-cp-heading="heading ? heading : undefined"
    :data-cp-body="body ? body : undefined"
    :style="textStyle"
  >
    <slot />
  </component>
</template>

<style lang="scss">
.cp-text {
  color: var(--color-black);
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  text-decoration: none;
  margin-top: 0;
  margin-bottom: 12px;

  &[data-cp-body="large"] {
    font-size: 16px;
    line-height: 20px;
  }

  &[data-cp-body="medium"] {
    font-size: 14px;
    line-height: 18px;
  }

  &[data-cp-body="small"] {
    font-size: 12px;
    line-height: 16px;
  }

  &[data-cp-body="micro"] {
    font-size: 10px;
    line-height: 14px;
  }

  &[data-cp-heading] {
    font-family: "Nunito", sans-serif;
    font-weight: 600;
  }

  &[data-cp-heading="1"] {
    font-size: 28px;
    line-height: 34px;
  }

  &[data-cp-heading="2"] {
    font-size: 24px;
    line-height: 30px;
  }

  &[data-cp-heading="3"] {
    font-size: 20px;
    line-height: 26px;
  }

  &[data-cp-heading="4"] {
    font-size: 16px;
    line-height: 22px;
  }

  &[data-cp-heading="5"] {
    font-size: 14px;
    line-height: 20px;
  }

  &[data-cp-heading="6"] {
    font-size: 12px;
    line-height: 18px;
  }
}

@include screen-md {
  .cp-text {
    &[data-cp-heading="1"] {
      font-size: 36px;
      line-height: 44px;
    }

    &[data-cp-heading="2"] {
      font-size: 32px;
      line-height: 40px;
    }

    &[data-cp-heading="3"] {
      font-size: 28px;
      line-height: 36px;
    }

    &[data-cp-heading="4"] {
      font-size: 24px;
      line-height: 32px;
    }

    &[data-cp-heading="5"] {
      font-size: 20px;
      line-height: 28px;
    }

    &[data-cp-heading="6"] {
      font-size: 16px;
      line-height: 24px;
    }
  }
}
</style>
