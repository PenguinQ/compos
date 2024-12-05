import type { Meta, StoryObj } from '@storybook/vue3';

import Page from './Page.vue';
import Header from './Header.vue';
import Content from './Content.vue';
import Container from './Container.vue';
import Footer from './Footer.vue';

const meta: Meta<typeof Content> = {
  title: 'Layout/Content',
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

// export const ContainerStory: StoryContainer = {
//   render: (args) => ({
//     components: { Container },
//     setup() {
//       return { args };
//     },
//     template: `
//       <Container v-bind="args">Content</Container>
//     `,
//   }),
//   argTypes: {
//     fluid: {
//       control: 'boolean',
//     },
//     breakpoint: {
//       control: 'select',
//       options: ['md'],
//     },
//   },
//   args: {
//     fluid: false,
//   },
// };

// ContainerStory.storyName = 'Container';
