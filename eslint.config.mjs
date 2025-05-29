import js from '@eslint/js'
import globals from 'globals'
import jest from 'eslint-plugin-jest'
import ava from 'eslint-plugin-ava'

export default [
  {
    files: ['**/*.js'], // Target JavaScript files
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Assume ES modules change to 'commonjs' if needed
      globals: {
        ...globals.node, // Node.js globals (e.g., process, module)
        ...globals.jest, // Jest globals for testing
      },
    },
    plugins: {
      jest, // Jest plugin for test files
      ava, // Ava plugin for test files
    },
    rules: {
      ...js.configs.recommended.rules, // Matches eslint:recommended
      indent: ['error', 4, { SwitchCase: 1 }], // 4-space indentation
      'linebreak-style': ['error', 'unix'], // Unix linebreaks
      quotes: ['error', 'single'], // Single quotes
      semi: ['error', 'always'], // Require semicolons
      'no-console': 'error', // Disallow console statements
      'no-prototype-builtins': 'off', // Allow prototype built-ins
    },
    ignores: [
      'node_modules/**', // Ignore node_modules
      'coverage/**', // Ignore test coverage reports
      '.circleci/**', // From your previous TypeScript config
      'eslint.config.mjs', // Ignore ESLint config file
    ],
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'], // Target test files
    plugins: {
      jest,
      ava,
    },
    rules: {
      ...jest.configs.recommended.rules, // Jest recommended rules
      ...ava.configs.recommended.rules, // Ava recommended rules
    },
  },
]