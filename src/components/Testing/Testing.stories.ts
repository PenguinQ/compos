import type { Meta, StoryObj } from '@storybook/vue3';

import Testing from './Testing.vue';
import TestingHead from './TestingHead.vue';
import TestingBody from './TestingBody.vue';

const meta: Meta<typeof Testing> = {
  component: Testing,
  tags: ['autodocs'],
  argTypes: {

  },
  args: {

  },
};

export default meta;
type Story = StoryObj<typeof Testing>;

export const Default: Story = {
  render: (args: any) => ({
    components: {
      Testing,
      TestingHead,
      TestingBody,
    },
    setup() {
      return { args };
    },
    template: `
      <Testing>
        <TestingHead>Head</TestingHead>
        <TestingBody>Body</TestingBody>
      </Testing>
    `,
  }),
};
