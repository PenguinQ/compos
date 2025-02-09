<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { RouterLink } from 'vue-router';
import type { AnchorHTMLAttributes } from 'vue';
import type { RouterLinkProps, RouteLocationRaw } from 'vue-router';
import type * as CSS from 'csstype';

import CardBody from './CardBody.vue';

import { useScopeId } from '@/hooks';

interface CardProps extends /* @vue-ignore */ AnchorHTMLAttributes, Omit<RouterLinkProps, 'to'> {
  /**
   * Set the Card title.
   */
  title?: string;
  /**
   * Set the Card subtitle
   */
  subtitle?: string;
  /**
   * Set the Card content.
   */
  content?: string;
  /**
   * Set the Card as clickable.
   */
  clickable?: boolean;
  /**
   * Set the CSS margin value of the Card.
   */
  margin?: CSS.Property.Margin;
  /**
   * Set the CSS padding value of the Card.
   */
  padding?: CSS.Property.Padding;
  /**
   * Set the CSS border-radius value of the Card.
   */
  radius?: CSS.Property.BorderRadius;
  /**
   * Set the target property if the `to` property is provided.
   */
  target?: '_self' | '_blank';
  /**
   * Set the href property sot the Card can act as a link.
   */
  to?: RouteLocationRaw;
  /**
   * Set the Card variant.
   */
  variant?: 'outline' | 'flat';
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CardProps>(), {
  clickable: false,
  target: '_self',
});

const CardHeader   = defineAsyncComponent(() => import('./CardHeader.vue'));
const CardTitle    = defineAsyncComponent(() => import('./CardTitle.vue'));
const CardSubtitle = defineAsyncComponent(() => import('./CardSubtitle.vue'));

const scope_id   = useScopeId();
const isExternal = computed(() => typeof props.to === 'string' && props.to.startsWith('http'));
const classes    = computed(() => ({
  'cp-card'           : true,
  'cp-card--link'     : props.to,
  'cp-card--clickable': props.clickable,
  'cp-card--flat'     : props.variant === 'flat',
  'cp-card--outline'  : props.variant === 'outline',
}));
</script>

<template>
  <template v-if="to">
    <a
      v-if="isExternal"
      v-bind="$attrs"
      :class="classes"
      :href="(to as string)"
      :target="target"
      :style="{ padding, margin, borderRadius: radius }"
      rel="noopener"
      :[`${scope_id}`]="''"
    >
      <slot v-if="$slots.default" />
      <template v-else>
        <CardHeader v-if="title">
          <CardTitle>{{ title }}</CardTitle>
          <CardSubtitle v-if="subtitle">{{ subtitle }}</CardSubtitle>
        </CardHeader>
        <CardBody v-if="content">{{ content }}</CardBody>
      </template>
    </a>
    <!-- @vue-ignore -->
    <RouterLink v-else v-bind="$props" v-slot="{ href, navigate }" custom>
      <a
        v-bind="$attrs"
        :class="classes"
        :href="href"
        :target="target"
        :style="{ padding, margin, borderRadius: radius }"
        rel="noopener"
        :[`${scope_id}`]="''"
        @click="navigate"
      >
      <slot v-if="$slots.default" />
      <template v-else>
        <CardHeader v-if="title">
          <CardTitle>{{ title }}</CardTitle>
          <CardSubtitle v-if="subtitle">{{ subtitle }}</CardSubtitle>
        </CardHeader>
        <CardBody v-if="content">{{ content }}</CardBody>
      </template>
      </a>
    </RouterLink>
  </template>
  <div
    v-else
    v-bind="$attrs"
    :class="classes"
    :style="{ padding, margin, borderRadius: radius }"
    :[`${scope_id}`]="''"
  >
    <slot v-if="$slots.default" />
    <template v-else>
      <CardHeader v-if="title">
        <CardTitle>{{ title }}</CardTitle>
        <CardSubtitle v-if="subtitle">{{ subtitle }}</CardSubtitle>
      </CardHeader>
      <CardBody v-if="content">{{ content }}</CardBody>
    </template>
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

  &--clickable,
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
    border: 1px solid var(--color-neutral-2);
    box-shadow: none;
  }
}
</style>
