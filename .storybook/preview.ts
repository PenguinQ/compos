import type { Preview } from '@storybook/vue3';

// CSS
import './preview.scss';

const preview: Preview = {
  parameters: {
    // actions: { argTypesRegex: "^on[A-Z].*" }, // Dropped in v8
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  // @ts-ignore
  tags: ["autodocs"],
};

export default preview;
