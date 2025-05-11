<script setup lang="ts">
import { computed, ref, reactive, onMounted, defineAsyncComponent } from 'vue';
import { RouterLink } from 'vue-router';
import type { AnchorHTMLAttributes, Slot, UnwrapRef } from 'vue';
import type { RouterLinkProps, RouteLocationRaw } from 'vue-router';

import type { ListTitleAs } from './ListTitle.vue';
import type { ListDescriptionAs } from './ListDescription.vue';

interface ListItem extends /* @vue-ignore */ AnchorHTMLAttributes, Omit<RouterLinkProps, 'to'> {
  /**
   * Set some text at the end of the ListItem.
   */
  append?: string;
  /**
   * Set the ListItem as a clickable button.
   */
  clickable?: boolean;
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
   *
   */
  target?: '_self' | '_blank' | '_parent' | '_top';
  /**
   * Render the title as another HTML tag, default as `h4`.
   */
  titleAs?: ListTitleAs;
  /**
   * Set the title of the ListItem.
   */
  title?: string;
  /**
   *
   */
  to?: string | RouteLocationRaw;
}

export type ListItemSlots = {
  /**
   * Slot used to create custom append, since append property only accept string.
   */
  append?: Slot;
  /**
   * Slot used to render `ListTitle`, `ListDescription` and other custom HTML or components.
   */
  default?: Slot;
  /**
   * Slot used to create custom prepend, since prepend property only accept string.
   */
  prepend?: Slot;
};

type ListInputs = {
  checkbox: HTMLDivElement | null,
  select: HTMLDivElement | null,
  textfield: HTMLDivElement | null,
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ListItem>(), {
  clickable: false,
});

const slots = defineSlots<ListItemSlots>();

const ListTitle       = defineAsyncComponent(() => import('./ListTitle.vue'));
const ListDescription = defineAsyncComponent(() => import('./ListDescription.vue'));

const isExternalLink   = ref(false);
const containerRef     = ref<HTMLDivElement | null>(null);
const appendRef        = ref<HTMLDivElement | null>(null);
const prependRef       = ref<HTMLDivElement | null>(null);
const hasInput         = ref(false);
const hasDisabledInput = ref(false);
const appendedInputs = reactive<ListInputs>({
  checkbox : null,
  select   : null,
  textfield: null,
});
const prependedInputs = reactive<ListInputs>({
  checkbox : null,
  select   : null,
  textfield: null,
});
const classes = computed(() => ({
  'cp-list-item'           : true,
  'cp-list-item--link'     : props.to && typeof props.to === 'string',
  'cp-list-item--clickable': props.clickable,
  'cp-list-item--input'    : hasInput.value,
}));

const searchElements = (inputs: UnwrapRef<ListInputs>, container: HTMLDivElement) => {
  inputs.checkbox  = container.querySelector<HTMLDivElement>('.cp-form-checkbox');
  inputs.select    = container.querySelector<HTMLDivElement>('.cp-form-select');
  inputs.textfield = container.querySelector<HTMLDivElement>('.cp-form-textfield');
};

const handleSelect = (wrapper: UnwrapRef<HTMLDivElement>) => {
  const select   = wrapper.querySelector('select');
  const disabled = select?.hasAttribute('disabled');

  if (disabled) {
    hasDisabledInput.value = true;
  } else {
    containerRef.value?.addEventListener('click', () => {
      select?.focus();

      if ('showPicker' in HTMLSelectElement.prototype) {
        (select as any)?.showPicker();
      } else {
        select?.dispatchEvent(new MouseEvent('mousedown'));
      }
    });
  }

  hasInput.value = true;
};

const handleCheckbox = (wrapper: UnwrapRef<HTMLDivElement>) => {
  const checkbox = wrapper.querySelector('input[type="checkbox"]');
  const disabled = checkbox?.hasAttribute('disabled');

  if (disabled) {
    hasDisabledInput.value = true;
  } else {
    containerRef.value?.addEventListener('click', () => {
      (checkbox as HTMLInputElement)?.click();
    });
  }

  hasInput.value = true;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') containerRef.value?.click();
};

onMounted(() => {
  if (containerRef.value) {
    if (slots.append !== undefined) {
      searchElements(appendedInputs, appendRef.value as HTMLDivElement);

      if (appendedInputs.select)   handleSelect(appendedInputs.select);
      if (appendedInputs.checkbox) handleCheckbox(appendedInputs.checkbox);
    }

    if (slots.prepend !== undefined) {
      searchElements(prependedInputs, prependRef.value as HTMLDivElement);

      if (prependedInputs.select)   handleSelect(prependedInputs.select);
      if (prependedInputs.checkbox) handleCheckbox(prependedInputs.checkbox);
    }
  }

  if (props.to) {
    isExternalLink.value = typeof props.to === 'string' && props.to.startsWith('http');
  }
});
</script>

<template>
  <template v-if="props.to">
    <a
      v-if="isExternalLink"
      ref="containerRef"
      v-bind="$attrs"
      :class="classes"
      :href="(to as string)"
      :target="target"
      :data-cp-disabled="hasDisabledInput ? hasDisabledInput : undefined"
    >
      <div ref="prependRef" v-if="prepend || $slots.prepend" class="cp-list-item__prepend">
        <slot v-if="$slots.prepend" name="prepend" />
        <template v-if="prepend">{{ prepend }}</template>
      </div>
      <div class="cp-list-item__content">
        <ListTitle v-if="title" :as="titleAs" v-html="title" />
        <ListDescription v-if="description" :as="descriptionAs" v-html="description" />
        <slot />
      </div>
      <div ref="appendRef" v-if="append || $slots.append" class="cp-list-item__append">
        <slot v-if="$slots.append" name="append" />
        <template v-if="append">{{ append }}</template>
      </div>
    </a>
    <RouterLink v-else :to="(to as RouteLocationRaw)" v-slot="{ href, navigate }" custom>
      <a
        ref="containerRef"
        v-bind="$attrs"
        :class="classes"
        :href="href"
        :target="target"
        @click="navigate"
      >
        <div ref="prependRef" v-if="prepend || $slots.prepend" class="cp-list-item__prepend">
          <slot v-if="$slots.prepend" name="prepend" />
          <template v-if="prepend">{{ prepend }}</template>
        </div>
        <div class="cp-list-item__content">
          <ListTitle v-if="title" :as="titleAs" v-html="title" />
          <ListDescription v-if="description" :as="descriptionAs" v-html="description" />
          <slot />
        </div>
        <div ref="appendRef" v-if="append || $slots.append" class="cp-list-item__append">
          <slot v-if="$slots.append" name="append" />
          <template v-if="append">{{ append }}</template>
        </div>
      </a>
    </RouterLink>
  </template>
  <div
    v-else
    ref="containerRef"
    v-bind="$attrs"
    :class="classes"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    :data-cp-disabled="hasDisabledInput ? hasDisabledInput : undefined"
    @keydown="handleKeydown"
  >
    <div ref="prependRef" v-if="prepend || $slots.prepend" class="cp-list-item__prepend">
      <slot v-if="$slots.prepend" name="prepend" />
      <template v-if="prepend">{{ prepend }}</template>
    </div>
    <div class="cp-list-item__content">
      <ListTitle v-if="title" :as="titleAs" v-html="title" />
      <ListDescription v-if="description" :as="descriptionAs" v-html="description" />
      <slot />
    </div>
    <div ref="appendRef" v-if="append || $slots.append" class="cp-list-item__append">
      <slot v-if="$slots.append" name="append" />
      <template v-if="append">{{ append }}</template>
    </div>
  </div>
</template>

<style lang="scss">
.cp-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid var(--color-neutral-2);
  padding-top: 0;
  padding-bottom: 0;
  padding-inline-start: var(--padding-start, 16px);
  padding-inline-end: var(--padding-start, 16px);

  &:last-child {
    border-bottom-color: transparent;
  }

  &__content {
    flex-grow: 1;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  &__prepend {
    margin-right: auto;

    .cp-form-select {
      .cp-form-field {
        text-align: left;
        text-align-last: left;
        padding-inline-start: 24px;
        padding-inline-end: 0;

        & + compos-icon {
          left: 0;
        }
      }
    }
  }

  &__append {
    margin-left: auto;

    .cp-form-select {
      .cp-form-field {
        text-align: right;
        text-align-last: right;
        padding-inline-start: 0;
        padding-inline-end: 24px;
      }
    }
  }

  &__prepend,
  &__append {
    .cp-form-checkbox {
      display: flex;
    }

    .cp-form-select {
      min-width: 120px;

      .cp-form-container {
        border: none;
        box-shadow: none;
      }

      .cp-form-field {
        @include text-body-md;
        text-overflow: ellipsis;

        & + compos-icon {
          width: 16px;
          height: 16px;
          margin-inline-end: 0;
          transition: none;
        }
      }

      &[data-cp-error] {
        .cp-form-field {
          color: var(--color-red-4);

          & + compos-icon {
            color: var(--color-red-4);
          }
        }
      }

      &[data-cp-disabled] {
        .cp-form-container {
          background-color: transparent;
        }

        .cp-form-field {
          color: var(--color-stone-3);

          & + compos-icon {
            color: var(--color-stone-3);
          }
        }
      }
    }
  }

  &--link,
  &--clickable,
  &--input {
    user-select: none;
    cursor: pointer;
  }

  &--link {
    text-decoration: none;

    &:visited {
      color: inherit;
    }
  }

  &--clickable {
    &:active {
      background-color: var(--color-neutral-1);
    }
  }

  &[data-cp-disabled] {
    cursor: not-allowed;
  }
}
</style>
