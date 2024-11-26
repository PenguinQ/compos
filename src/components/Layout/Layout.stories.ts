import type { Meta, StoryObj } from '@storybook/vue3';

import Content from './Content.vue';
import Footer from './Footer.vue';
import Header from './Header.vue';
import Page from './Page.vue';

const meta: Meta<typeof Content> = {
  component: Content,
  argTypes: {
  },
  args: {
  },
};

export default meta;

type Story = StoryObj<typeof Content>;

export const Default: Story = {
  render: (args) => ({
    components: { Content },
    setup() {
      return { args };
    },
    template: `<Content v-bind="args">{{ args.default }}</Content>`,
  }),
};
