<script setup lang="ts">
import { computed, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import type { AnchorHTMLAttributes } from 'vue';
import type { RouterLinkProps } from 'vue-router';

interface Props extends AnchorHTMLAttributes, RouterLinkProps {
  body?: 'large' | 'medium' | 'small' | 'micro';
  color?: string,
  fontSize?: string,
  fontStyle?: string,
  fontWeight?: string,
  lineHeight?: string,
  textAlign?: string,
  textDecoration?: string,
  textTransform?: string,
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
</script>

<template>
  <a
    v-if="isExternal"
    v-bind="$attrs"
    class="cp-link"
    :href="(to as string)"
    :target="target"
    :data-cp-body="body ? body : undefined"
    :style="linkStyle"
  >
    <slot />
  </a>
  <RouterLink v-else
    v-bind="$props"
    v-slot="{ href, navigate }"
    custom
  >
    <a
      v-bind="$attrs"
      class="cp-link"
      :href="href"
      :target="target"
      :data-cp-body="body ? body : undefined"
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
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  text-decoration: none;

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

  .cp-text & {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
  }
}
</style>
