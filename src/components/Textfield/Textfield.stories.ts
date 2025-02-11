import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { Text } from '@components';
import ComposIcon, { Cash, Translate } from '@components/Icons';
import Textfield from './Textfield.vue';

type TextfieldProps = ComponentProps<typeof Textfield>;

const meta: Meta<TextfieldProps> = {
  component: Textfield,
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
  },
  args: {
    disabled: false,
    error: false,
    success: false,
    type: 'text',
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

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Text, Textfield },
    setup() {
      const value = ref('');

      return { value };
    },
    template: `
      <Text>Textfield value: {{ value ? value : '-' }}</Text>
      <Textfield v-model="value" />
    `,
  }),
};

export const DocNonTWDB = {
  tags: ['!dev'],
  render: () => ({
    components: { Text, Textfield },
    setup() {
      const value = ref('');

      const handleInput = (e: Event) => {
        value.value = (e.target as HTMLInputElement).value;
      };

      return { value, handleInput };
    },
    template: `
      <Text>Textfield value: {{ value ? value : '-' }}</Text>
      <Textfield @input="handleInput" />
    `,
  }),
};

export const DocAppendPrepend = {
  tags: ['!dev'],
  render: () => ({
    components: { ComposIcon, Textfield },
    setup() {
      return { Cash, Translate };
    },
    template: `
      <Textfield prepend="Prepend" placeholder="Prepend text using prepend prop" />
      <br />
      <Textfield placeholder="Prepend text / anything using slot">
        <template #prepend>Prepend</template>
      </Textfield>
      <br />
      <Textfield placeholder="Prepend text / anything using slot">
        <template #prepend>
          <ComposIcon :icon="Cash" />
        </template>
      </Textfield>
      <br />
      <Textfield append="Append" placeholder="Append text using append prop" />
      <br />
      <Textfield placeholder="Append text / anything using slot">
        <template #append>Append</template>
      </Textfield>
      <br />
      <Textfield placeholder="Append text / anything using slot">
        <template #append>
          <ComposIcon :icon="Translate" />
        </template>
      </Textfield>
    `,
  }),
};
