import { ref, watch } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text, Ticker, TickerItem } from '@components';
import Textfield from './Textfield.vue';

import { onlyShowArgs } from '@docs/helpers';

type TextfieldProps = ComponentProps<typeof Textfield>;

const defaultArgs: any = {
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
  labelProps: {
    control: 'object',
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
    control: 'text',
  },
  modelValue: {
    name: 'v-model',
    control: 'text',
  },
};

const meta: Meta<TextfieldProps> = {
  component: Textfield,
  argTypes: defaultArgs,
  args: {
    append: '',
    containerProps: undefined,
    disabled: undefined,
    error: undefined,
    label: '',
    labelProps: undefined,
    margin: '',
    message: '',
    placeholder: '',
    prepend: '',
    modelValue: '',
    success: undefined,
    type: undefined,
    value: '',
  },
};

export default meta;

type Story = StoryObj<TextfieldProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Textfield },
    setup() {
      return { args };
    },
    template: `<Textfield v-bind="args" />`,
  }),
};

export const AppendPrependSlot: Story = {
  name: 'Append/prepend using slot',
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
  },
};

export const UsingVModel: Story = {
  name: 'Using v-model (two-way data binding)',
  render: (args) => ({
    components: { Text, Textfield },
    setup() {
      const textfieldValue = ref(args.modelValue);

      watch(
        () => args.modelValue,
        (newValue) => {
          textfieldValue.value = newValue;
        },
      );

      return { textfieldValue };
    },
    template: `
      <Text>v-model value: {{ textfieldValue ? textfieldValue : '-' }}</Text>
      <Textfield v-model="textfieldValue" />
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, ['modelValue']),
};

export const UsingValue: Story = {
  name: 'Using value (non two-way data binding)',
  render: (args) => ({
    components: { Text, Textfield },
    setup() {
      const textfieldValue = ref(args.value);

      watch(
        () => args.value,
        (newValue) => {
          textfieldValue.value = newValue;
        },
      );

      const handleInput = (e: Event) => {
        textfieldValue.value = (e.target as HTMLInputElement).value;
      };

      return { textfieldValue, handleInput };
    },
    template: `
      <Text>Inputted value: {{ textfieldValue ? textfieldValue : '-' }}</Text>
      <Textfield :value="textfieldValue" @input="handleInput" />
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, ['value']),
};
