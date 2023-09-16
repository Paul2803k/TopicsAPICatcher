module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2020: true,
        jest: true,
    },
    parser: '@babel/eslint-parser',

    extends: [
        'prettier',
        'plugin:prettier/recommended',
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:import/recommended',
        'plugin:jest/recommended',
    ],

    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: ['react', 'react-hooks', 'import', 'prettier', 'jest'],
    rules: {
        'no-var': 'warn',
        'no-alert': 'warn',
        'no-extra-bind': 'warn',
        'no-multi-spaces': 'warn',
        'no-unused-expressions': 'warn',
        'comma-spacing': 'warn',
        'no-trailing-spaces': 'warn',
        semi: 'warn',
        'space-before-blocks': 'warn',
        'arrow-spacing': 'warn',
        'no-duplicate-imports': 'error',
        'import/no-cycle': 'error',
        'import/no-unused-modules': 'warn',
        'import/named': 'error',
        'prefer-arrow-callback': 'warn',
        'no-console': 'off',
        'no-process-env': 0,
        'react/prop-types': 0,
        radix: 0,
        'prettier/prettier': 'error',
        'react-hooks/rules-of-hooks': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
        react: {
            pragma: 'React',
            version: 'detect',
        },
    },
};
