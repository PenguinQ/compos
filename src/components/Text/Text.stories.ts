import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import { CSS } from '@story/constants';

import Text from './Text.vue';

type TextProps = ComponentProps<typeof Text>;

const meta: Meta<TextProps> = {
  component: Text,
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'b', 'strong', 'p', 'div', 'label'],
    },
    heading: {
      control: 'select',
      options: ['1', '2', '3', '4', '5', '6'],
    },
    body: {
      control: 'select',
      options: ['large', 'medium', 'small', 'micro'],
    },
    color: {
      control: 'text',
    },
    fontSize: {
      control: 'text',
    },
    fontStyle: {
      control: 'text',
    },
    fontWeight: {
      control: 'text',
    },
    lineHeight: {
      control: 'text',
    },
    textAlign: {
      control: 'select',
      options: CSS.textAlign,
    },
    textDecoration: {
      control: 'text',
    },
    textTransform: {
      control: 'select',
      options: CSS.textTransform,
    },
    truncate: {
      control: 'boolean',
    },
    margin: {
      control: 'text',
    },
    padding: {
      control: 'text',
    },
  },
  args: {
    as: undefined,
    heading: undefined,
    body: undefined,
    color: '',
    fontSize: '',
    fontStyle: '',
    fontWeight: '',
    lineHeight: '',
    textAlign: undefined,
    textDecoration: '',
    textTransform: undefined,
    truncate: false,
    margin: '',
    padding: '',
  },
};

export default meta;

type Story = StoryObj<TextProps>;

export const Default: Story = {
  render: (args) => ({
    components: { Text },
    setup() {
      return { args };
    },
    template: `
      <Text v-bind="args">
        An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.
      </Text>
    `,
  }),
};

export const Heading: Story = {
  render: (args) => ({
    components: { Text },
    setup() {
      return { args };
    },
    template: `
      <Text heading="1">(Heading 1) Himeko</Text>
      <Text heading="2">(Heading 2) Himeko</Text>
      <Text heading="3">(Heading 3) Himeko</Text>
      <Text heading="4">(Heading 4) Himeko</Text>
      <Text heading="5">(Heading 5) Himeko</Text>
      <Text heading="6">(Heading 6) Himeko</Text>
    `,
  }),
};

export const Body: Story = {
  render: (args) => ({
    components: { Text },
    setup() {
      return { args };
    },
    template: `
      <Text body="large">
        (Large) An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.
      </Text>
      <Text body="medium">
        (Medium) An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.
      </Text>
      <Text>
        (Default) An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.
      </Text>
      <Text body="small">
        (Small) An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.
      </Text>
      <Text body="micro">
        (Micro) An adventurous scientist who encountered and repaired a stranded train as a child, she now ventures across the universe with the Astral Express as its navigator.
      </Text>
    `,
  }),
};
