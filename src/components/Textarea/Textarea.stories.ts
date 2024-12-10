import { ref, watch } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import { Text } from '@components';
import Textarea from './Textarea.vue';

import { onlyShowArgs } from '@docs/helpers';

const defaultArgs: any = {
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
  maxRows: {
    control: 'number',
  },
  message: {
    control: 'text',
  },
  minRows: {
    control: 'number',
  },
  placeholder: {
    control: 'text',
  },
  success: {
    control: 'boolean',
  },
  value: {
    control: 'text',
  },
  modelValue: {
    name: 'v-model',
    control: 'text',
  },
};

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  argTypes: defaultArgs,
  args: {
    containerProps: undefined,
    disabled: undefined,
    error: undefined,
    label: '',
    labelProps: undefined,
    margin: '',
    maxRows: undefined,
    message: '',
    minRows: undefined,
    placeholder: '',
    modelValue: '',
    success: undefined,
    value: '',
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  render: (args) => ({
    components: { Textarea },
    setup() {
      return { args };
    },
    template: `<Textarea v-bind="args" />`,
  }),
};

export const UsingVModel: Story = {
  name: 'Using v-model (two-way data binding)',
  render: (args) => ({
    components: { Text, Textarea },
    setup() {
      const textareaValue = ref(args.modelValue);

      watch(
        () => args.modelValue,
        (newValue) => {
          textareaValue.value = newValue;
        },
      );

      return { textareaValue };
    },
    template: `
      <Text>v-model value: {{ textareaValue ? textareaValue : '-' }}</Text>
      <Textarea v-model="textareaValue" />
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, ['modelValue']),
};

export const UsingValue: Story = {
  name: 'Using value (non two-way data binding)',
  render: (args) => ({
    components: { Text, Textarea },
    setup() {
      const textareaValue = ref(args.value);

      watch(
        () => args.value,
        (newValue) => {
          textareaValue.value = newValue;
        },
      );

      const handleInput = (e: Event) => {
        textareaValue.value = (e.target as HTMLInputElement).value;
      };

      return { textareaValue, handleInput }
    },
    template: `
      <Text>Inputted value: {{ textareaValue ? textareaValue : '-' }}</Text>
      <Textarea :value="textareaValue" @input="handleInput" />
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, ['value']),
};
