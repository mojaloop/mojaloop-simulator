
const testLogger = (t) => ({
    log: (message) => t.log(message),
    push: () => ({ log: (message) => t.log(message) }),
});

module.exports = {
    testLogger,
};
