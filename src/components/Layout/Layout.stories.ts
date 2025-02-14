import type { Meta, StoryObj } from '@storybook/vue3';

import Container from './Container.vue';
import Content from './Content.vue';
import Header from './Header.vue';
import Footer from './Footer.vue';
import Page from './Page.vue';

const meta: Meta = {
  title: 'Layouts/Test',
  // component: Content,
  subcomponents: {
    Container,
    Content,
    Header,
    Footer,
    Page,
  },
};

export default meta;

type Story = StoryObj;

export const StoryContainer: Story = {
  render: (args) => ({
    components: { Page },
    setup() {
      return { args };
    },
    template: `
      <Page>
        Berak
      </Page>
    `,
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
