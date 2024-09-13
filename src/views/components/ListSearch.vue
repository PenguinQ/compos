<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

// Common Components
import Textfield, { TextfieldExpose } from '@components/Textfield';
import ComposIcon, { XCircleFilled } from '@components/Icons';

type ListSearchProps = {
  placeholder?: string;
  sticky?: boolean;
  modelValue?: string;
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ListSearchProps>(), {
  sticky: false,
});

const emit = defineEmits(['update:modelValue', 'clear']);

const container = ref<HTMLDivElement>();
const classes = computed(() => ({
  'vc-list-search': true,
  'vc-list-search--sticky': props.sticky,
}));

const handleScroll = () => {
  const DOM_container = container.value;

  if (DOM_container) {
    if (window.scrollY > 56) {
      DOM_container.style.transform = 'translateY(-56px)';
    } else {
      DOM_container.style.transform = '';
    }
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const DOM_container = container.value;

    if (props.sticky && DOM_container) {
      const bound = DOM_container.getBoundingClientRect();

      DOM_container.style.top = `${bound.y}px`;
    }

    window.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll);
  }
});

const handleInput = (e: Event) => {
  const input = e.target as HTMLInputElement;

  emit('update:modelValue', input.value);
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('clear');
};
</script>

<template>
  <div ref="container" :class="classes">
    <Textfield
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
    >
      <template v-if="modelValue" #append>
        <button class="button button--clear vc-list-search__clear" type="button" @click="handleClear">
          <ComposIcon :icon="XCircleFilled" />
        </button>
      </template>
    </Textfield>
  </div>
</template>

<style lang="scss">
.vc-list-search {
  background-color: #FFF;
  border-bottom: 1px solid var(--color-neutral-2);
  padding: 8px 16px;
  margin-bottom: 16px;
  transition: transform var(--transition-duration-very-fast) var(--transition-timing-function);

  &--sticky {
    border-bottom-color: transparent;
    box-shadow:
      rgba(0, 0, 0, 0.16) 0 3px 6px,
      rgba(0, 0, 0, 0.23) 0 3px 6px;
    position: sticky;
    top: 0;
    z-index: var(--z-4);
  }

  &__clear {
    line-height: 1px;
  }
}
</style>
