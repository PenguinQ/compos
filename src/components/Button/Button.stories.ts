import type { Meta, StoryObj } from '@storybook/vue3';
import type { ComponentProps } from 'vue-component-type-helpers';

import ComposIcon, { Archive } from '@components/Icons';
import Button from './Button.vue';
import ButtonGroup from './ButtonGroup.vue';

type ButtonProps = ComponentProps<typeof Button>;

const meta: Meta<ButtonProps> = {
  component: Button,
  subcomponents: { ButtonGroup },
  argTypes: {
    color: {
      control: 'select',
      options: ['red', 'green', 'blue'],
    },
    disabled: {
      control: 'boolean',
    },
    full: {
      control: 'boolean',
    },
    icon: {
      control: 'boolean',
    },
    variant: {
      control: 'select',
      options: ['outline', 'text'],
    },
    padding: {
      control: 'text',
    },
  },
  args: {
    disabled: false,
    full: false,
    icon: false,
  },
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Playground: Story = {
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: `
      <Button v-bind="args">Start "Divergent Universe"</Button>
    `,
  }),
};

export const DocUsage = {
  tags: ['!dev'],
  render: () => ({
    components: { Button },
    setup() {
      const handleClick = () => {
        console.log('Clicked!');
      };

      return { handleClick };
    },
    template: `
      <Button @click="handleClick">Start "Divergent Universe"</Button>
    `,
  }),
};

export const DocSubcomponents = {
  tags: ['!dev'],
  render: () => ({
    components: { Button, ButtonGroup },
    setup() {
      const handleClick = () => {
        console.log('Clicked!');
      };

      return { handleClick };
    },
    template: `
      <ButtonGroup>
        <Button @click="handleClick">Synthesize</Button>
        <Button @click="handleClick">Nameless Honor</Button>
        <Button @click="handleClick">Interastral Guide</Button>
        <Button @click="handleClick">Data Bank</Button>
      </ButtonGroup>
    `,
  }),
};

export const DocIcon = {
  tags: ['!dev'],
  render: () => ({
    components: { Button, ComposIcon },
    setup() {
      return { Archive };
    },
    template: `
      <Button icon>
        <ComposIcon :icon="Archive" />
      </Button>
    `,
  }),
};
