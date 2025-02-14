import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import Checkbox from './Checkbox.vue';

type CheckboxProps = ComponentProps<typeof Checkbox>;

const meta: Meta<CheckboxProps> = {
  component: Checkbox,
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
    falseValue: {
      control: 'text',
    },
    full: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    labelProps: {
      control: 'object',
    },
    message: {
      control: 'text',
    },
    modelValue: {
      name: 'v-model',
      control: 'text',
    },
    tabindex: {
      control: 'text',
    },
    trueValue: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
  },
  args: {
    disabled: false,
    error: false,
    full: false,
  },
};

export default meta;

type Story = StoryObj<CheckboxProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup() {
      return { args };
    },
    template: `
      <Checkbox v-bind="args" />
    `,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Checkbox, Text },
    setup() {
      const checked = ref(false);

      return { checked };
    },
    template: `
      <Text>Simulated Universe Insight Mode: {{ checked }}</Text>
      <Checkbox v-model="checked" label="Insight Mode" />
    `,
  }),
};

export const DocNonTWDB = {
  tags: ['!dev'],
  render: () => ({
    components: { Checkbox, Text },
    setup() {
      const checked = ref<boolean | string>(false);

      const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const targetChecked = target.checked;

        if (targetChecked) {
          checked.value = target.value;
        } else {
          checked.value = false;
        }
      };

      return { checked, handleChange };
    },
    template: `
      <Text>Simulated Universe Insight Mode: {{ checked }}</Text>
      <Checkbox label="Insight Mode" @change="handleChange" />
    `,
  }),
};

export const DocMultiple = {
  tags: ['!dev'],
  render: () => ({
    components: { Checkbox, Text },
    setup() {
      const selected = ref(['Kafka', 'Himeko']);

      return { selected };
    },
    template: `
      <Text margin="0 0 16px">Selected Checkboxes: {{ selected }}</Text>
      <div style="display: flex; gap: 16px;">
        <Checkbox v-model="selected" value="Kafka" label="Kafka" />
        <Checkbox v-model="selected" value="Himeko" label="Himeko" />
        <Checkbox v-model="selected" value="Natasha" label="Natasha" />
        <Checkbox v-model="selected" value="Ruan Mei" label="Ruan Mei" />
      </div>
    `,
  }),
};
