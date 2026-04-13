import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": ["@chromatic-com/storybook", "@storybook/addon-docs"],
  "framework": {
    "name": "@storybook/nextjs-vite",
    "options": {}
  },
};
export default config;