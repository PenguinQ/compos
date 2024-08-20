import type { Meta, StoryObj } from '@storybook/vue3';

import Column from './Column.vue';
import Container from './Container.vue';
import Row from './Row.vue';

const meta: Meta<typeof Container> = {
  component: Container,
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
      <Container v-bind="args">Content</Container>
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
        <Row v-bind="args">
          <Column>Column 1</Column>
          <Column>Column 2</Column>
          <Column>Column 3</Column>
          <Column>Column 4</Column>
        </Row>
      </Container>
    `,
  }),
  argTypes: {
    align: {
      control: 'select',
      options: [
        'normal',
        'flex-start',
        'flex-end',
        'center',
        'start',
        'end',
        'self-start',
        'self-end',
        'baseline',
        'first baseline',
        'last baseline',
        'stretch',
        'safe',
        'unsafe',
      ],
    },
    col: {
      control: 'number',
    },
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
    },
    gutter: {
      control: 'text',
    },
    justify: {
      control: 'select',
      options: [
        'start',
        'end',
        'flex-start',
        'flex-end',
        'center',
        'left',
        'right',
        'normal',
        'space-between',
        'space-around',
        'space-evenly',
        'stretch',
      ],
    },
    margin: {
      control: 'text',
    },
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
          <Column v-bind="args">This Will Change</Column>
          <Column>Column 2</Column>
          <Column>Column 3</Column>
          <Column>Column 4</Column>
        </Row>
      </Container>
    `,
  }),
  argTypes: {
    align: {
      control: 'select',
      options: [
        'auto',
        'normal',
        'self-start',
        'self-end',
        'flex-start',
        'flex-end',
        'center',
        'baseline',
        'first baseline',
        'last baseline',
        'stretch',
        'safe',
        'unsafe',
      ],
    },
    col: {
      control: 'number',
    },
    order: {
      control: 'number',
    },
  },
};

ColumnStory.storyName = 'Column';
