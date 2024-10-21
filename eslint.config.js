import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
            },
        },
    },
    {
        ignores: [
            'build/',
            '.svelte-kit/',
            'dist/',
            'tailwind.config.ts',
            'vite.config.ts.*',
            'src/lib/shadcn/',
            'docs/',
            'drizle/',
        ],
    },
    {
        rules: {
            camelcase: 'error',
            eqeqeq: 'error',
            'no-useless-assignment': 'warn',
            'consistent-return': 'error',
            'dot-notation': 'error',
            'no-unneeded-ternary': 'warn',
            'object-shorthand': 'error',
            'prefer-const': 'warn',
            'prefer-destructuring': 'error',
            'no-useless-rename': 'error',
            'no-cond-assign': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error', // Change to 'error' if you want it to be an error
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
];
