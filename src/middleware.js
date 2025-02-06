const { generateSlug } = require('random-word-slugs');

// todo: review code to avoid duplication
const createRequestLoggingMiddleware = (simLogger) => async function requestLoggingMiddleware (ctx, next) {
    // Create new child for lifespan of request
    ctx.state.logger = simLogger.child({
        context: {
            app: 'simulator',
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        }

    });

    if (ctx.path === '/' || ctx.path === '/health') {
        ctx.state.logger.isDebugEnabled && ctx.state.logger.debug({'msg': 'Request received', body: ctx.request.body});

        await next();

        const { body, status } = ctx.response;
        ctx.state.logger.isDebugEnabled && ctx.state.logger.debug({'msg': 'Request processed', body, status});
    } else {
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request received', body: ctx.request.body});

        await next();

        const { body, status } = ctx.response;
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request processed', body, status});
    }
};

const createReportLoggingMiddleware = (reportLogger) => async function reportLoggingMiddleware (ctx, next) {
    // Create new child for lifespan of request
    ctx.state.logger = reportLogger.child({
        context: {
            app: 'report',
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        }

    });
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request received', body: ctx.request.body});

    await next();

    const { body, status } = ctx.response;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request processed', body, status});
};

const createTestApiLoggingMiddleware = (testApiLogger) => async function testApiLoggingMiddleware (ctx, next) {
    // Create new child for lifespan of request
    ctx.state.logger = testApiLogger.child({
        context: {
            app: 'test-api',
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        }
    });
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request received', body: ctx.request.body});

    await next();

    const { body, status } = ctx.response;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request processed', body, status});
};

module.exports = {
    createRequestLoggingMiddleware,
    createReportLoggingMiddleware,
    createTestApiLoggingMiddleware
};
