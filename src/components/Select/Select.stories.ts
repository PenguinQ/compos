import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import Select from './Select.vue';

type SelectProps = ComponentProps<typeof Select>;

const meta: Meta<SelectProps> = {
  component: Select,
  argTypes: {
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
    mode: {
      control: 'select',
      options: ['list'],
    },
  },
  args: {
    disabled: false,
    error: false,
    success: false,
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
      <Select v-bind="args" />
    `,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Select },
    setup() {
      const value = ref('');
      const options = [
        { value: '', text: 'Pick your Character' },
        { value: 'Himeko', text: 'Himeko' },
        { value: 'Jade', text: 'Jade' },
        { value: 'Aglaea', text: 'Aglaea' },
        { value: 'Kafka', text: 'Kafka' },
        { value: 'Natasha', text: 'Natasha' },
        { value: 'Black Swan', text: 'Black Swan' },
        { value: 'Acheron', text: 'Acheron' },
        { value: 'Feixiao', text: 'Feixiao' },
      ];

      return { value, options };
    },
    template: `
      <Select v-model="value">
        <option :key="index" v-for="(option, index) in options" :value="option.value">
          {{ option.text }}
        </option>
      </Select>
    `,
  }),
};

export const DocObject = {
  tags: ['!dev'],
  render: () => ({
    components: { Select },
    setup() {
      const value = ref('');
      const options = [
        { value: '', text: 'Pick your Character' },
        { value: 'Himeko', text: 'Himeko' },
        { value: 'Jade', text: 'Jade' },
        { value: 'Aglaea', text: 'Aglaea' },
        { value: 'Kafka', text: 'Kafka' },
        { value: 'Natasha', text: 'Natasha' },
        { value: 'Black Swan', text: 'Black Swan' },
        { value: 'Acheron', text: 'Acheron' },
        { value: 'Feixiao', text: 'Feixiao' },
      ];

      return { value, options };
    },
    template: `
      <Select v-model="value" :options="options" />
    `,
  }),
};

export const DocNonTWDB = {
  tags: ['!dev'],
  render: () => ({
    components: { Select, Text },
    setup() {
      const selectValue = ref('');
      const options = [
        { value: '', text: 'Pick your Character' },
        { value: 'Himeko', text: 'Himeko' },
        { value: 'Jade', text: 'Jade' },
        { value: 'Aglaea', text: 'Aglaea' },
        { value: 'Kafka', text: 'Kafka' },
        { value: 'Natasha', text: 'Natasha' },
        { value: 'Black Swan', text: 'Black Swan' },
        { value: 'Acheron', text: 'Acheron' },
        { value: 'Feixiao', text: 'Feixiao' },
      ];

      const handleChange = (value: string) => {
        selectValue.value = value;
      };

      return { selectValue, options, handleChange };
    },
    template: `
      <Text>Select value: {{ selectValue ? selectValue : '-' }}</Text>
      <Select :options="options" @change="handleChange" />
    `,
  }),
};
