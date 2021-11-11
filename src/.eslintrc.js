const config = {
    extends: 'airbnb-base',
    plugins: ['jest'],
    env: {
        node: true,
        'jest/globals': true,
    },
    rules: {
        indent: [
            'error',
            4,
            { SwitchCase: 1 },
        ],
        'spaced-comment': [
            'error',
            'always',
            {
                exceptions: ['*'],
            },
        ],
        'max-len': [
            'error',
            100,
            2,
            {
                ignoreUrls: true,
                ignoreComments: true,
                ignoreRegExpLiterals: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        strict: [
            'off',
        ],
        'lines-around-directive': [
            'error',
            {
                before: 'never',
                after: 'always',
            },
        ],
        'no-await-in-loop': [
            'off',
        ],
        'no-restricted-syntax': [
            'off',
        ],
    },
};

module.exports = config;
