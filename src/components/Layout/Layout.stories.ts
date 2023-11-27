import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import Column from './Column.vue';
import Container from './Container.vue';
import Row from './Row.vue';

const meta: Meta<typeof Container> = {
  component: Container,
  tags: ['autodocs'],
};

export default meta;
type StoryContainer = StoryObj<typeof Container>;
type StoryRow = StoryObj<typeof Row>;
type StoryColumn = StoryObj<typeof Column>;

export const ContainerStory: StoryContainer = {
  render: (args) => ({
    components: { Container },
    setup() {
      return { args };
    },
    template: `
      <Container v-bind="args">Normal Container</Container>
      <Container fluid>Fluid Container</Container>
    `,
  }),
  argTypes: {
    fluid: {
      control: 'boolean',
    },
    breakpoint: {
      control: 'select',
      options: ['md'],
    },
  },
  args: {
    fluid: false,
  },
};

ContainerStory.storyName = 'Container';

export const RowStory: StoryRow = {
  render: (args) => ({
    components: { Container, Row, Column },
    setup() {
      return { args };
    },
    template: `
      <Container>
        <Row column="auto">
          <Column column="auto">Column 1</Column>
          <Column>Column 2</Column>
          <Column>Column 3</Column>
        </Row>
      </Container>
    `,
  }),
  argTypes: {

  },
};

RowStory.storyName = 'Row';

export const ColumnStory: StoryColumn = {
  render: (args) => ({
    components: { Container, Row, Column },
    setup() {
      return { args };
    },
    template: `
      <Container>
        <Row>
          <Column>Column 1</Column>
          <Column>Column 2</Column>
          <Column>Column 3</Column>
          <Column>Column 4</Column>
        </Row>
      </Container>
    `,
  }),
};

ColumnStory.storyName = 'Column';
