import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Ticker, { TickerItem } from '@components/Ticker';
import Text from '@components/Text';
import Textfield from './Textfield.vue';

const meta: Meta<typeof Textfield> = {
  component: Textfield,
  tags: ['autodocs'],
  argTypes: {
    append: {
      control: 'text',
    },
    containerProps: {
      control: 'object',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    margin: {
      control: 'text',
    },
    message: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    prepend: {
      control: 'text',
    },
    success: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['email', 'number', 'password', 'tel', 'text'],
    },
    value: {
      table: {
        disable: true,
      },
    },
    ['modelValue']: {
      table: {
        disable: true,
      },
    },
    ['update:modelValue']: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    append: '',
    containerProps: {},
    disabled: false,
    error: false,
    label: '',
    margin: '',
    message: '',
    placeholder: '',
    prepend: '',
    success: false,
    type: 'text',
  },
};

export default meta;

type Story = StoryObj<typeof Textfield>;

export const Default: Story = {
  render: (args) => ({
    components: { Textfield },
    setup() {
      return { args };
    },
    template: `<Textfield v-bind="args" />`,
  }),
};

export const AppendPrependSlot: Story = {
  render: (args) => ({
    components: { Text, Textfield, Ticker, TickerItem },
    setup() {
      const value = ref('');

      return { args, value };
    },
    template: `
      <Ticker>
        <TickerItem
          title="Customize Append or Prepend"
          description="If you wanted to have customized DOM inside append or prepend, you can pass it as a slot item."
        />
      </Ticker>

      <Text margin="16px 0">Prepend</Text>
      <Textfield v-bind="args">
        <template #prepend>
          <span style="color: var(--color-red-4)">Prepend</span>
        </template>
      </Textfield>

      <Text margin="16px 0">Append</Text>
      <Textfield v-bind="args">
        <template #append>
          <span style="color: var(--color-red-4)">Append</span>
        </template>
      </Textfield>
    `,
  }),
  argTypes: {
    append: {
      table: {
        disable: true,
      },
    },
    prepend: {
      table: {
        disable: true,
      },
    },
  }
};

AppendPrependSlot.storyName = 'Append/prepend slot';

export const UsingVModel: Story = {
  render: (args) => ({
    components: { Text, Textfield },
    setup() {
      const value = ref('');

      return { args, value };
    },
    template: `
      <Text>v-model: {{ value }}</Text>
      <Textfield v-bind="args" v-model="value" />
    `,
  }),
};

UsingVModel.storyName = 'Using v-model (recommended)';

export const UsingValue: Story = {
  render: (args) => ({
    components: { Text, Textfield },
    setup() {
      const input_value = ref('');

      const handleInput = (e: Event) => {
        input_value.value = (e.target as HTMLInputElement).value;
      };

      return { args, input_value, handleInput };
    },
    template: `
      <Text>value: {{ input_value }}</Text>
      <Textfield v-bind="args" :value="input_value" @input="handleInput" />
    `,
  }),
};

UsingValue.storyName = 'Using value';
