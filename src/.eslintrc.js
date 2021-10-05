const config = {
    extends: 'airbnb-base',
    env: {
        node: true,
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
    },
};

module.exports = config;
