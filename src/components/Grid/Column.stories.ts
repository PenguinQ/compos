import type { Meta, StoryObj } from '@storybook/vue3';
import { ComponentProps } from 'vue-component-type-helpers';

import { Container } from '@/components';
import Column from './Column.vue';
import Row from './Row.vue';

type ColumnProps = ComponentProps<typeof Column>;

const meta: Meta<ColumnProps> = {
  title: 'Layouts/Grid/Column',
  component: Column,
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

type StoryColumn = StoryObj<ColumnProps>;

export const ColumnStory: StoryColumn = {
  name: 'Playground',
  render: (args) => ({
    components: { Row, Column },
    setup() {
      return { args };
    },
    template: `
      <Row>
        <Column v-bind="args" class="grid-column">
          <div style="color: var(--color-yellow-7)">
            1
            <br />
            (Changing Column)
          </div>
        </Column>
        <Column class="grid-column" order="2">
          2
          <br />
          (Order 2)
        </Column>
        <Column class="grid-column" order="3">
          3
          <br />
          (Order 3)
        </Column>
      </Row>
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
      control: {
        type: 'number',
        min: 0,
        max: 12,
      },
    },
    offset: {
      type: 'number',
      min: 0,
      max: 11,
    },
    order: {
      type: 'number',
      min: -1,
    },
  },
};
