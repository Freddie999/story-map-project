import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: false,
  }),
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, '@stylistic': stylistic },
    extends: ['js/recommended'],
    ignores: ['examples/**/*.js'],
    languageOptions: {
      globals: {
        L: 'readonly',
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['off'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
      '@stylistic/max-statements-per-line': ['off'],
      '@stylistic/quote-props': ['error', 'consistent'],
      '@stylistic/quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': 'always' }],
    },
  },
]);
