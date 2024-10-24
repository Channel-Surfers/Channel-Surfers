import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import drizzle from 'eslint-plugin-drizzle';
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
        plugins: {
            drizzle
        },
        rules: {
            camelcase: [
                'error',
                {
                    ignoreImports: true,
                },
            ],
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
            'drizzle/enforce-delete-with-where': 'error',
            'drizzle/enforce-update-with-where': 'error',
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
