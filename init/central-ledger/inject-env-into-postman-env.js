const fs = require('fs');

const envFileContents = fs.readFileSync('./Onboard-Generic-FSP.postman_environment.json');

const envJson = Object.freeze(JSON.parse(envFileContents));

const populatedEnvJson = {
    ...envJson,
    _postman_exported_at: (new Date()).toISOString(),
    values: [
      ...envJson.values,
    ].map(value => ({
        key: value.key,
        value: process.env[value.key] || '',
        enabled: value.enabled,
    })),
};

fs.writeFileSync('./Onboard-Generic-FSP-POPULATED.postman_environment.json', JSON.stringify(populatedEnvJson));

console.log(`--- Onboard-Generic-FSP-POPULATED.postman_environment.json ---`);
console.log(JSON.parse(fs.readFileSync('./Onboard-Generic-FSP-POPULATED.postman_environment.json')));
console.log(`---`);
