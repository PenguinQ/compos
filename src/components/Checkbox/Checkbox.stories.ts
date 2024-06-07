import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Checkbox from './Checkbox.vue';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    class: {
      type: 'string',
    },
    disabled: {
      type: 'boolean',
    },
    falseValue: {
      type: 'string',
    },
    full: {
      type: 'boolean',
    },
    label: {
      type: 'string',
    },
    message: {
      type: 'string',
    },
    tabindex: {
      type: 'string',
    },
    trueValue: {
      type: 'string',
    },
    value: {
      type: 'string',
    },
    ['modelValue']: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    class: '',
    disabled: false,
    falseValue: '',
    full: false,
    label: '',
    message: '',
    tabindex: '0',
    trueValue: '',
    value: '',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup() {
      const selected = ref();
      return { args, selected };
    },
    template: `
      <Checkbox v-bind="args" v-model="selected" />
    `,
  }),
};

export const Multiple: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup() {
      const selected = ref([]);

      return { args, selected };
    },
    template: `
      <div>Selected: {{ selected }}</div>
      <div style="display: flex; gap: 16px;">
        <Checkbox v-model="selected" value="Kafka" label="Kafka" />
        <Checkbox v-model="selected" value="Himeko" label="Himeko" />
        <Checkbox v-model="selected" value="Natasha" label="Natasha" />
        <Checkbox v-model="selected" value="Ruan Mei" label="Ruan Mei" />
      </div>
    `,
  }),
};
