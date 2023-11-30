import type { Meta, StoryObj } from '@storybook/vue3';

import Text from './Text.vue';

const meta: Meta<typeof Text> = {
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'b', 'strong', 'p', 'div', 'label'],
    },
    heading: {
      control: 'select',
      options: ['1' , '2', '3', '4', '5', '6'],
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
      control: 'text',
    },
    textDecoration: {
      control: 'text',
    },
    textTransform: {
      control: 'text',
    },
    margin: {
      control: 'text',
    },
    padding: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  render: (args) => ({
    components: { Text },
    setup() {
      return { args };
    },
    template: `
      <Text v-bind="args">
        Off the coast of Mexico, the ship of shark fin smuggler Carlos Santiago is caught in a hurricane, interrupting his meeting with a potential buyer.
        A tornado throws swarms of sharks onto the boat, killing all aboard.
      </Text>
    `,
  }),
};
