import type { Meta } from '@storybook/vue3';

import { Column, Row, Text } from '@/components';
import ColorBlock from './ColorBlock.vue';
import ColorPalette from './ColorPalette.vue';

const meta: Meta = {
  title: 'General/Colors',
};

export default meta;

export const Base = {
  tags: ['!dev'],
  render: () => ({
    components: {
      ColorBlock,
      Column,
      Row,
      Text,
    },
    setup() {
      return {};
    },
    template: `
      <Row col="2">
        <Column>
          <Text heading="6" textTransform="capitalize">Black</Text>
          <ColorBlock color="var(--color-white)" backgroundColor="var(--color-black)">
            <span>var(--color-black)</span>
            <span>#2E4057</span>
          </ColorBlock>
        </Column>
        <Column>
          <Text heading="6" textTransform="capitalize">White</Text>
          <ColorBlock color="var(--color-black)" backgroundColor="var(--color-white)">
            <span>var(--color-white)</span>
            <span>#FFFFFF</span>
          </ColorBlock>
        </Column>
      </Row>
    `,
  }),
};

export const Monochromatic = {
  tags: ['!dev'],
  render: () => ({
    components: {
      ColorPalette,
      Column,
      Row,
      Text,
    },
    setup() {
      const colors = [
        'neutral',
        'stone',
        'red',
        'green',
        'blue',
        'yellow',
      ];

      return {
        colors,
      };
    },
    template: `
      <Row col="3">
        <Column v-for="color in colors">
          <Text heading="6" textTransform="capitalize">{{ color }}</Text>
          <ColorPalette :color="color" />
        </Column>
      </Row>
    `,
  }),
};
