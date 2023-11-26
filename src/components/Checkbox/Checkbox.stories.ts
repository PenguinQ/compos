import type { Meta, StoryObj } from '@storybook/vue3';

import Checkbox from './Checkbox.vue';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => ({
    components: { Checkbox },
    setup() {
      return { args };
    },
    template: `<Checkbox v-bind="args" />`,
  }),
};
