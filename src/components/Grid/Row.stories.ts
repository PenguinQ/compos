import type { Meta, StoryObj } from '@storybook/vue3';
import { ComponentProps } from 'vue-component-type-helpers';

import { Container } from '@/components';
import Column from './Column.vue';
import Row from './Row.vue';

type RowProps = ComponentProps<typeof Row> & { previewColumnNumber: number };

const meta: Meta<RowProps> = {
  title: 'Layouts/Grid/Row',
  component: Row,
  decorators: [
    () => ({
      components: { Container },
      template: `
        <Container
          style="
            background: repeating-linear-gradient(
              45deg,
              var(--color-red-1),
              var(--color-red-1) 10px,
              var(--color-red-2) 10px,
              var(--color-red-2) 20px
            );
          "
        >
          <story />
        </Container>
      `,
    }),
  ],
};

export default meta;

type StoryRow = StoryObj<RowProps>;

export const RowStory: StoryRow = {
  name: 'Playground',
  render: (args) => ({
    components: { Row, Column },
    setup() {
      return { args };
    },
    template: `
      <Row v-bind="args">
        <Column :key="index" v-for="(column, index) of args.previewColumnNumber" class="grid-column">
          {{ column }}
        </Column>
      </Row>
    `,
  }),
  argTypes: {
    previewColumnNumber: {
      name: 'Number of Columns',
      control: {
        type: 'number',
        min: 1,
        max: 12,
      },
    },
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
      control: {
        type: 'number',
        min: 0,
        max: 12,
      },
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
  },
  args: {
    previewColumnNumber: 12,
  },
};

export const GridPreview = {
  tags: ['!dev', '!autodocs'],
  render: () => ({
    components: { Row, Column },
    setup() {
      return {};
    },
    template: `
      <Row>
        <Column class="grid-column">1</Column>
        <Column class="grid-column">2</Column>
        <Column class="grid-column">3</Column>
        <Column class="grid-column">4</Column>
        <Column class="grid-column">5</Column>
        <Column class="grid-column">6</Column>
        <Column class="grid-column">7</Column>
        <Column class="grid-column">8</Column>
        <Column class="grid-column">9</Column>
        <Column class="grid-column">10</Column>
        <Column class="grid-column">11</Column>
        <Column class="grid-column">12</Column>
      </Row>
    `,
  }),
};
