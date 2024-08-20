import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';

import QuantityEditor from './QuantityEditor.vue';

const meta: Meta<typeof QuantityEditor> = {
  component: QuantityEditor,
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    labelProps: {
      control: 'object',
    },
    message: {
      control: 'text',
    },
  },
  args: {
    disabled: false,
    label: '',
    labelProps: {},
    message: '',
  },
};

export default meta;
type Story = StoryObj<typeof QuantityEditor>;

export const Default: Story = {
  render: (args) => ({
    components: { QuantityEditor },
    setup() {
      return { args };
    },
    template: `<QuantityEditor v-bind="args" />`,
  }),
};

// export const OnChange: Story = {
//   render: (args) => ({
//     components: { QuantityEditor },
//     setup() {
//       const quantity = ref(0);

//       const handleButtons = (value: string) => {
//         quantity.value = parseInt(value);
//       };

//       return { args, quantity, handleButtons };
//     },
//     template: `
//       Quantity: {{ quantity }}
//       <br />
//       <br />
//       <QuantityEditor
//         value="quantity"
//         @clickIncrement="handleButtons"
//         @clickDecrement="handleButtons"
//       />
//     `,
//   }),
// };
