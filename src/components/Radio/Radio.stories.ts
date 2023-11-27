import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Radio from './Radio.vue';
import RadioGroup from './RadioGroup.vue';

const meta: Meta<typeof Radio> = {
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      type: 'boolean',
    },
    full: {
      type: 'boolean',
    },
    label: {
      type: 'string',
    },
    value: {
      type: 'string',
    },
    tabindex: {
      type: 'string',
    },
    ['modelValue']: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    disabled: false,
    full: false,
    tabindex: '0',
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: (args) => ({
    components: { Radio },
    setup() {
      return { args };
    },
    template: `
      <Radio v-bind="args" />
    `,
  }),
};

export const Multiple: Story = {
  render: (args) => ({
    components: { Radio, RadioGroup },
    setup() {
      const selected = ref('');

      return { args, selected };
    },
    template: `
      <div>Selected: {{ selected }}</div>
      <RadioGroup>
        <Radio v-model="selected" value="Kafka" label="Kafka" />
        <Radio v-model="selected" value="Himeko" label="Himeko" />
        <Radio v-model="selected" value="Natasha" label="Natasha" />
        <Radio v-model="selected" value="Ruan Mei" label="Ruan Mei" />
      </RadioGroup>
    `,
  }),
};
