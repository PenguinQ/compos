import path from 'path';
import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: [
    './stories/**/*.mdx',
    './stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {},
  async viteFinal(config: any, {}) {
    return {
      ...config,
      css: {
        postcss: null,
        preprocessorOptions: {
          scss: {
            additionalData: `
              @import '@assets/mixins';
            `,
          },
        },
      },
      resolve: {
        alias: {
          ...config.resolve.alias,
          '@': path.resolve(__dirname, '../src'),
          '@assets': path.resolve(__dirname, '../src/assets'),
          '@components': path.resolve(__dirname, '../src/components'),
          '@helpers': path.resolve(__dirname, '../src/helpers'),
          '@hooks': path.resolve(__dirname, '../src/hooks'),
          '@icons': path.resolve(__dirname, '../src/components/icons'),
          '@docs': path.resolve(__dirname, '../.storybook'),
        },
      },
    };
  }
};

export default config;
