import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import Radio from './Radio.vue';
import RadioGroup from './RadioGroup.vue';

type RadioProps = ComponentProps<typeof Radio>;

const meta: Meta<RadioProps> = {
  component: Radio,
  subcomponents: { RadioGroup },
  argTypes: {
    containerProps: {
      control: 'object',
    },
    disabled: {
      control: 'boolean',
    },
    full: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    modelValue: {
      name: 'v-model',
      control: 'text',
    },
    tabindex: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
  },
  args: {
    disabled: false,
    full: false,
    tabindex: '0',
  },
};

export default meta;

type Story = StoryObj<RadioProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Radio },
    setup() {
      const handleClick = (e) => {
        console.log(e.target);
      };

      return { args, handleClick };
    },
    template: `
      <Radio v-bind="args" @click="handleClick" />
    `,
  }),
  args: {
    label: 'Energy Regeneration Rate',
  },
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Radio, RadioGroup, Text },
    setup() {
      const value = ref('');

      return { value };
    },
    template: `
      <Text>Enter Simulated Universe: {{ value ? value : '-' }}</Text>
      <Radio v-model="value" value="Yes" label="Yes" />
      <br />
      <Radio v-model="value" value="No" label="No" />
    `,
  }),
};


export const DocSubComponents = {
  tags: ['!dev'],
  render: () => ({
    components: { Radio, RadioGroup, Text },
    setup() {
      const value = ref('');

      return { value };
    },
    template: `
      <Text>Selected Character: {{ value ? value : '-' }}</Text>
      <RadioGroup v-model="value">
        <Radio value="Kafka" label="Kafka" />
        <Radio value="Himeko" label="Himeko" />
        <Radio value="Natasha" label="Natasha" />
        <Radio value="Ruan Mei" label="Ruan Mei" />
      </RadioGroup>
    `,
  }),
};

export const DocNonTWDB = {
  tags: ['!dev'],
  render: () => ({
    components: { Radio, RadioGroup, Text },
    setup() {
      const radioValue = ref('');

      const handleClick = (e: Event) => {
        radioValue.value = (e.target as HTMLInputElement).value;
      };

      return { radioValue, handleClick };
    },
    template: `
      <Text>Enter Simulated Universe: {{ radioValue ? radioValue : '-' }}</Text>
      <Radio name="radio1" value="Yes" label="Yes" @click="handleClick" />
      <br />
      <Radio name="radio1" value="No" label="No" @click="handleClick" />
    `,
  }),
};
