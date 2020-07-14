const testLogger = (t) => ({
    log: (message) => t.log(message),
    push: () => ({ log: (message) => t.log(message) }),
});

/**
 * Makes a deep clone of an object or array.
 *
 * Note that this will only copy JSON-compatible properties,
 * things like function etc. will be lost.
 * This function should only be used to clone simple objects with
 * some depth which cannot be successfully cloned using other means.
 *
 * @returns {Object} clone of argument.
 */
const cloneDeep = (o) => JSON.parse(JSON.stringify(o));

module.exports = {
    testLogger,
    cloneDeep,
};
