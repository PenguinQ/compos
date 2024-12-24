import { ref, watch } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import Select from './Select.vue';

import { onlyShowArgs } from '@docs/helpers';

type SelectProps = ComponentProps<typeof Select>;

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
  message: {
    control: 'text',
  },
  options: {
    control: 'object',
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

const meta: Meta<SelectProps> = {
  component: Select,
  argTypes: defaultArgs,
  args: {
    containerProps: undefined,
    disabled: undefined,
    error: undefined,
    label: '',
    labelProps: undefined,
    margin: '',
    message: '',
    modelValue: '',
    success: undefined,
    value: '',
  },
};

export default meta;

type Story = StoryObj<SelectProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Select },
    setup() {
      return { args };
    },
    template: `
      <Select v-bind="args">
        <option value="">Pick your Character</option>
        <option value="Himeko">Himeko</option>
        <option value="Jade">Jade</option>
        <option value="Kafka">Kafka</option>
        <option value="Natasha">Natasha</option>
        <option value="Black Swan">Black Swan</option>
        <option value="Acheron">Acheron</option>
        <option value="Feixiao">Feixiao</option>
      </Select>
    `,
  }),
};

export const ObjectOptions: Story = {
  name: 'Options as object',
  render: (args) => ({
    components: { Select },
    setup() {
      return { args };
    },
    template: `
      <Select v-bind="args" />
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, ['options']),
  args: {
    options: [
      { value: '', text: 'Pick your Character' },
      { value: 'Himeko', text: 'Himeko' },
      { value: 'Jade', text: 'Jade' },
      { value: 'Kafka', text: 'Kafka' },
      { value: 'Natasha', text: 'Natasha' },
      { value: 'Black Swan', text: 'Black Swan' },
      { value: 'Acheron', text: 'Acheron' },
      { value: 'Feixiao', text: 'Feixiao' },
    ]
  },
};

export const UsingVModel: Story = {
  name: 'Using v-model (two-way data binding)',
  render: (args) => ({
    components: { Text, Select },
    setup() {
      const selectValue = ref(args.modelValue);

      watch(
        () => args.modelValue,
        (newValue) => {
          selectValue.value = newValue;
        },
      );

      return { args, selectValue };
    },
    template: `
      <Text>v-model value: {{ selectValue ? selectValue : '-' }}</Text>
      <Select v-model="selectValue">
        <option value="">Pick your Character</option>
        <option value="Himeko">Himeko</option>
        <option value="Jade">Jade</option>
        <option value="Kafka">Kafka</option>
        <option value="Natasha">Natasha</option>
        <option value="Black Swan">Black Swan</option>
        <option value="Acheron">Acheron</option>
        <option value="Feixiao">Feixiao</option>
      </Select>
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, ['modelValue']),
};

export const UsingValue: Story = {
  name: 'Using value (non two-way data binding)',
  render: (args) => ({
    components: { Text, Select },
    setup() {
      const selectValue = ref(args.value);

      watch(
        () => args.value,
        (newValue) => {
          selectValue.value = newValue;
        },
      );

      const handleChange = (value: string) => {
        selectValue.value = value;
      };

      return {
        selectValue,
        handleChange,
      };
    },
    template: `
      <Text>Inputted value: {{ selectValue ? selectValue : '-' }}</Text>
      <Select :value="selectValue" @change="handleChange">
        <option value="">Pick your Character</option>
        <option value="Himeko">Himeko</option>
        <option value="Jade">Jade</option>
        <option value="Kafka">Kafka</option>
        <option value="Natasha">Natasha</option>
        <option value="Black Swan">Black Swan</option>
        <option value="Acheron">Acheron</option>
        <option value="Feixiao">Feixiao</option>
      </Select>
    `,
  }),
  argTypes: onlyShowArgs(defaultArgs, ['value']),
};
