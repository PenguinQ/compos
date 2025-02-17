import type { Preview } from '@storybook/vue3';

import './preview.scss';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'General',
          'Layouts',
          'Components',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
