const config = {
    env: {
        es2020: true,
        node: true,
        'jest/globals': true,
    },
    plugins: ['ava', 'jest'],
    extends: 'eslint:recommended',
    rules: {
        indent: [
            'error',
            4,
            { SwitchCase: 1 },
        ],
        'linebreak-style': [
            2,
            'unix',
        ],
        quotes: [
            2,
            'single',
        ],
        semi: [
            2,
            'always',
        ],
        'no-console': 2,
        'no-prototype-builtins': 'off',
    }
};

module.exports = config;
