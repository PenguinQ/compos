import path from 'path';
import type { StorybookConfig } from '@storybook/vue3-vite';
import remarkGfm from 'remark-gfm';
import autoprefixer from 'autoprefixer';

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
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    }
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {},
  async viteFinal(config: any, {}) {
    return {
      ...config,
      resolve: {
        alias: {
          ...config.resolve.alias,
          '@': path.resolve(__dirname, '../src'),
          '@assets': path.resolve(__dirname, '../src/assets'),
          '@components': path.resolve(__dirname, '../src/components'),
          '@helpers': path.resolve(__dirname, '../src/helpers'),
          '@hooks': path.resolve(__dirname, '../src/hooks'),
          '@icons': path.resolve(__dirname, '../src/components/Icons'),
          '@story': path.resolve(__dirname, '../.storybook'),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `
              @import '@/assets/core.mixins';
            `,
          },
        },
        postcss: {
          plugins: [
            autoprefixer({}),
          ],
        },
      },
    };
  }
};

export default config;
