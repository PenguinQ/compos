<script lang="ts">
export default { name: 'TickerItem' };
</script>
<script setup lang="ts">
import Text from '@components/Text';
import Icon from '@icons';

export type TickerItemProps = {
  title: string;
  description: string;
  type?: 'error' | 'info' | 'warning';
};

const props = withDefaults(defineProps<TickerItemProps>(), {
  type: 'info',
});

let icon_type = 'info-circle-filled';

switch (props.type) {
  case 'error':
    icon_type = 'x-circle-filled';
    break;
  case 'warning':
    icon_type = 'warning-circle-filled';
    break;
  default:
    break;
}
</script>

<template>
  <div class="cp-ticker-item">
    <Icon class="cp-ticker-item__icon" :name="icon_type" size="72" />
    <div class="cp-ticker-item__content">
      <div class="cp-ticker-item__title">
        <Text v-if="title" heading="6" as="h4" margin="0" v-html="title" />
        <slot name="title" />
      </div>
      <div class="cp-ticker-item__description">
        <Text v-if="description" margin="0" v-html="description" />
        <slot name="description" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$root-container: '.cp-ticker';
$root: '.cp-ticker-item';

@keyframes slideIn {
  0% {
    transform: translate3d(-50%, 0, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0%, 0, 0);
    opacity: 0.4;
  }
}

.cp-ticker-item {
  flex: 0 0 100%;
  position: relative;
  overflow: hidden;
  padding: 16px 24px;

  &__icon {
    fill: var(--color-neutral-5);
    position: absolute;
    top: -12px;
    left: -12px;
    z-index: 1;
    opacity: 0;

    #{$root-container}--error & {
      fill: var(--color-red-7);
    }

    #{$root-container}--info & {
      fill: var(--color-blue-7);
    }

    #{$root-container}--warning & {
      fill: var(--color-yellow-7);
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    flex-grow: 1;
  }

  &__title {
    font-family: var(--text-heading-family);
    font-size: var(--text-heading-6-size);
    line-height: var(--text-heading-6-height);
  }

  &__description {
    margin-top: 4px;
  }

  &[data-cp-active] {
    #{$root}__icon {
      animation: slideIn var(--transition-duration-slow) var(--transition-timing-function) 160ms forwards;
    }
  }
}
</style>
