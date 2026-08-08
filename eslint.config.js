import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'coverage', 'public'] },

  js.configs.recommended,

  {
    // Type-aware linting only where a tsconfig actually covers the file.
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Clean code: an exported boundary states its own contract.
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // SPEC section 2: the app makes no network call at runtime.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'The app must make no runtime network call (SPEC section 2).' },
        {
          name: 'XMLHttpRequest',
          message: 'The app must make no runtime network call (SPEC section 2).',
        },
      ],

      // SOLID and clean code, mechanised: one responsibility per file, shallow branching.
      complexity: ['error', 10],
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  {
    // Build and tooling config files run in Node and sit outside the app's tsconfig.
    files: ['**/*.js', 'vite.config.ts', 'vitest.config.ts'],
    languageOptions: { globals: globals.node },
    rules: { '@typescript-eslint/explicit-module-boundary-types': 'off' },
  },

  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    // Tests describe scenarios; the file-length cap would only fragment them.
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  prettier,
);
