<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type * as CSS from 'csstype';
import { useScopeId } from '@hooks';

import Overlay from '@/components/Overlay';
import ComposIcon, { X } from '@/components/Icons';

type Dialog = {
  /**
   * Set the Dialog height to take 100% of the screen, preferred using it for mobile view.
   */
  fullscreen?: boolean;
  /**
   * Hide the Dialog header.
   */
  hideHeader?: boolean;
  /**
   * Set the maximum width of the Dialog.
   */
  maxWidth?: CSS.Property.MaxWidth;
  /**
   * Set the minimum width of the Dialog.
   */
  minWidth?: CSS.Property.MinWidth;
  modelValue?: boolean;
  /**
   * Hide close button.
   */
  noClose?: boolean;
  /**
   * Turn the Dialog persistent, disabled closing when clicking the overlay.
   */
  persistent?: boolean;
  /**
   * Set the Dialog header title.
   */
  title?: string;
  /**
   * Set the width of the Dialog.
   */
  width?: CSS.Property.Width;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Dialog>(), {
  fullscreen: false,
  hideHeader: false,
  noClose   : false,
  persistent: false,
});

const emits = defineEmits([
  'update:modelValue',
  'before-enter',
  'enter',
  'after-enter',
  'enter-cancelled',
  'before-leave',
  'leave',
  'after-leave',
  'leave-cancelled',
]);

const scope_id = useScopeId();
const show     = ref(props.modelValue !== undefined ? props.modelValue : false);
const classes  = computed(() => ({
  'cp-dialog'            : true,
  'cp-dialog--fullscreen': props.fullscreen,
}));

const closeDialog = () => {
  show.value = false;
  emits('update:modelValue', false);
};

const handleClickActivator = () => {
  show.value = !show.value;
  emits('update:modelValue', show.value);
};

const activator_props = reactive({
  onclick: handleClickActivator,
});

watch(
  () => props.modelValue,
  (newModel) => {
    show.value = newModel;
    emits('update:modelValue', newModel);
  },
);
</script>

<template>
  <slot name="activator" v-bind="{ props: activator_props }" />
  <Overlay
    class="cp-overlay--dialog"
    role="dialog"
    aria-modal="true"
    :padding="fullscreen ? 0 : '16px'"
    :fullscreen="fullscreen"
    :modelValue="show"
    @before-enter="$emit('before-enter')"
    @enter="$emit('enter')"
    @after-enter="$emit('after-enter')"
    @enter-cancelled="$emit('enter-cancelled')"
    @before-leave="$emit('before-leave')"
    @leave="$emit('leave')"
    @after-leave="$emit('after-leave')"
    @leave-cancelled="$emit('leave-cancelled')"
    @onClickBackdrop="!persistent && closeDialog()"
  >
    <div
      v-if="show"
      v-bind="$attrs"
      :[scope_id]="''"
      :class="classes"
      :style="{ maxWidth, minWidth, width }"
    >
      <div v-if="!hideHeader" class="cp-dialog-header">
        <slot name="header" v-bind="{ props: activator_props }" />
        <div v-if="!$slots.header" class="cp-dialog-header__content">
          <h3 v-if="title" class="cp-dialog__title">{{ title }}</h3>
          <button
            v-if="!noClose"
            class="cp-dialog__close"
            type="button"
            aria-label="Close"
            @click="closeDialog"
          >
            <ComposIcon :icon="X" />
          </button>
        </div>
      </div>
      <div v-if="$slots.default" class="cp-dialog-body">
        <div class="cp-dialog-body__inner">
          <slot />
        </div>
      </div>
      <div v-if="$slots.footer" class="cp-dialog-footer">
        <slot name="footer" v-bind="{ props: activator_props }" />
      </div>
    </div>
  </Overlay>
</template>

<style lang="scss">
$root: '.cp-dialog';
$headerFullHeight: 56px;

.cp-dialog {
  min-width: calc(320px - 32px);
  background-color: white;
  border-radius: 8px;
  box-shadow: rgba(50, 50, 93, 0.25) 0 2px 5px -1px, rgba(0, 0, 0, 0.3) 0 1px 3px -1px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all var(--transition-duration-normal) var(--transition-timing-function);

  &__close {
    line-height: 1px;
    background-color: var(--color-black);
    border: 1px solid var(--color-black);
    border-radius: 8px;
    box-shadow: rgba(50, 50, 93, 0.25) 0 2px 5px -1px, rgba(0, 0, 0, 0.3) 0 1px 3px -1px;
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    transform: translate(50%, -50%);
    padding: 0;
    transition: all var(--transition-duration-normal) var(--transition-timing-function);
    transform-origin: center;

    compos-icon {
      color: var(--color-white);
    }

    &:active {
      transform: translate(50%, -50%) scale(0.9);
    }
  }

  &-header__content {
    position: relative;
  }

  &__title {
    line-height: 28px;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 16px 16px 0;
    margin: 0;
  }

  &-body {
    padding: 16px;
  }

  &--fullscreen {
    @include page;
    border-radius: 0px;

    #{$root}-header__content {
      height: $headerFullHeight;
      color: var(--color-white);
      background-color: var(--color-black);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: rgba(0, 0, 0, 0.16) 0 3px 6px, rgba(0, 0, 0, 0.23) 0 3px 6px;
    }

    #{$root}__title {
      @include text-heading-3;
      color: var(--color-white);
      text-align: left;
      padding: 0 0 0 16px;
    }

    #{$root}__close {
      width: $headerFullHeight;
      height: $headerFullHeight;
      background-color: transparent;
      border: none;
      box-shadow: none;
      flex-shrink: 0;
      position: relative;
      transform: none;

      compos-icon {
        width: 40px;
        height: 40px;
        transition: transform var(--transition-duration-normal) var(--transition-timing-function);
      }

      &:active compos-icon {
        transform: scale(0.85);
      }
    }

    #{$root}-body {
      @include content;

      &__inner {
        @include content-inner;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }
    }
  }

  .v-enter-from &,
  .v-leave-to & {
    opacity: 0;
    transform: translateY(8px);

    &--fullscreen {
      opacity: 0;
      transform: translateY(100%);
    }
  }
}

@include screen-md {
  .cp-dialog {
    &__title {
      @include text-heading-4;
    }

    &--fullscreen {
      #{$root}__title {
        @include text-heading-5;
      }
    }
  }
}
</style>
