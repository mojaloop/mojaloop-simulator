/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 --------------
 ******/
'use strict';

// TODO: is it worth bringing in an external lib just for converting params to JSON schema?
// Consider replacing this.
const paramsToJsonSchema = require('openapi-jsonschema-parameters').convertParametersToJSONSchema;
const jsrp = require('json-schema-ref-parser');
const util = require('util');
const Ajv = require('ajv');

// Don't stop at the first error, we'll let the user know what all their errors are. Also, when we
// validate, coerce types to those we're interested in where possible.
const ajv = new Ajv({ allErrors: true, coerceTypes: true, strict: false });

const httpMethods = ['get', 'head', 'post', 'put', 'delete', 'connnect', 'options', 'trace', 'patch'];

// Extract the body schema if it's nested within content.'application/json'
const extractBody = (rqBody) => {
    if (rqBody && 'content' in rqBody) {
        if ('application/json' in rqBody.content) {
            return rqBody.content['application/json'].schema;
        }
        // TODO: handle more content types
        throw new Error('Unhandled content type');
    }
    return rqBody;
};

// Create a json schema in the format we've chosen to use
const createSchema = (pathValue, methodValue) => {
    const properties = {
        ...paramsToJsonSchema([...(pathValue.parameters || []), ...(methodValue.parameters || [])]),
        body: extractBody(methodValue.requestBody) || {},
    };
    // Make all header keys lower-case
    if ('headers' in properties && 'properties' in properties.headers) {
        properties.headers.properties = Object.assign(
            ...Object.entries(properties.headers.properties)
                .map(([headerName, value]) => ({ [headerName.toLowerCase()]: value })),
        );
        properties.headers.required = properties.headers.required.map((r) => r.toLowerCase());
    }
    const required = Object.entries(properties)
        .filter(([, value]) => value.required && value.required.length > 0)
        .map(([prop]) => prop);
    return {
        type: 'object',
        properties,
        required,
    };
};

// Here we're transforming the incoming openapi spec to combine path-level parameters and
// method-level parameters, to get everything in the format we'll validate with.
//
// Input:
// {
//   /path/to/resource: {
//     parameters: { required: true, in: "headers", name: "content-type", type: "integer" },
//     get": {
//       parameters: { required: true, in: "query", name: "length", type: "integer" },
//       requestBody: { "$ref": "#/components/requestBodies/someBodyObj" }
//     }
//   }
// }
//
// Output:
// {
//   /path/to/resource: {
//     get: {
//       validator: {
//         [ Function validate ]
//         schema: {
//           query: { properties: { length: { type: "string" } }, required: ["length"] },
//           body: { "$ref": "#/components/requestBodies/someBodyObj" },
//           headers: {
//             properties: { "content-type": { type: "integer" } },
//             required: ["content-type"]
//           }
//         }
//       }
//     }
//   }
// }
const transformApiDoc = (apiDoc) => ({
    ...apiDoc,
    // TODO: as we now discard most of the extra information, it probably makes sense to explicitly
    // return the object form we're interested in, rather than do all of this awkward object
    // mapping. I.e.:
    // return { get: { validator: [Function validator] },
    // put: { validator: [Function validator] } };
    paths: Object.assign(...Object.entries(apiDoc.paths).map(([pathName, pathValue]) => ({
        [pathName]: Object.assign(
            ...Object.entries(pathValue)
                .filter(([method]) => httpMethods.includes(method))
                .map(([method, methodValue]) => {
                    const validatorF = ajv.compile(createSchema(pathValue, methodValue));
                    return {
                        [method]: {
                            validator: (ctx, path) => {
                                const result = validatorF({
                                    body: ctx.request.body,
                                    headers: ctx.request.headers,
                                    params: ctx.params,
                                    query: ctx.request.query,
                                    path,
                                });
                                if (result === true) {
                                    return undefined;
                                }
                                return validatorF.errors;
                            },
                        },
                    };
                }),
        ),
    }))),
});

class Validator {
    // apiDoc
    //   POJO representing apiDoc API spec. Example:
    //   const v = new Validator(require('./apiDoc.json'));
    async initialise(apiDoc, multiDfsp) {
    // Dereferencing the api doc makes it much easier to work with. Specifically, it allows us
    // to compile a validator for each path.
        const pojoApiDoc = await jsrp.dereference(apiDoc);

        this.apiDoc = transformApiDoc(pojoApiDoc);
        const pathParamMatch = /\{[^{}]+\}/g;
        this.paths = Object.entries(this.apiDoc.paths).map(([path, pathSpec]) => ({
            pattern: multiDfsp ? `/{dfspId}${path}` : path,
            matcher: {
                // If we were using node 10, instead of having this awkward params object, we could
                // replace the path parameters with named regex matches corresponding to the path
                // names.
                regex: new RegExp(`^${(multiDfsp ? `/{dfspId}${path}` : path).replace(pathParamMatch, '([^{}/]+)')}$`),
                params: ((multiDfsp ? `/{dfspId}${path}` : path).match(pathParamMatch) || []).map((s) => s.replace(/(^{|}$)/g, '')),
            },
            methods: { ...pathSpec },
        }));
    }

    // TODO: roll the entire validation functionality into a single function? Or split it out into
    // path, headers, body, query? Or neither? If we validate the body separately, we can avoid
    // parsing the body until (and unless) it comes time for body validation. BUT this means we
    // won't tell the user everything that's wrong with their request in a single response, which
    // is probably more valuable, given the purpose of the simulator. However; having the lib
    // support this option would be good.
    validatePath(path, logger) {
        const result = this.paths.find((p) => path.match(p.matcher.regex) !== null);

        if (result === undefined) {
            throw new Error(`Couldn't match path ${path}`);
        }
        result.params = Object.assign({}, ...path.match(result.matcher.regex)
            .slice(1)
            .map((m, i) => ({ [result.matcher.params[i]]: m })));

        if (path == '/' || path == '/health') {
            logger.isDebugEnabled && logger.debug({'msg': 'Matched path', path, result});
        } else {
            logger.isInfoEnabled && logger.info({'msg': 'Matched path', path, result});
        }
        return result;
    }

    validateRequest(ctx, logger) {
        const path = this.validatePath(ctx.path, logger);
        if (!(ctx.method.toLowerCase() in path.methods)) {
            throw new Error(`Method ${ctx.method} not supported for path ${ctx.path}`);
            // TODO: 404
        }

        const validationResult = path.methods[ctx.method.toLowerCase()].validator(ctx, path.params);
        if (validationResult !== undefined) {
            throw new Error(util.format('Request failed validation', validationResult));
        }
        return path;
    }
}

module.exports = Validator;
