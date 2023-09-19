import taxonomy from './taxonomy.js';

let frameUrl = document.location.href;
let MAX_NUM_CALLS_TO_INTERCEPT = 10;
let STACK_LINE_REGEXP = /(\()?(http[^)]+):[0-9]+:[0-9]+(\))?/;
let accessCounts = {}; // keep the access and call counts for each property and function
let ENABLE_CONSOLE_LOGS = true;

// firefox doesn't support ancestorOrigins so we need to do
// something else.
const getAncestor = function () {
    var origins = location.ancestorOrigins;
    if (!origins) {
        origins = {length: 1};
        try {
            if (window.parent[0].top.document)
                // Chrome & Firefox (same domain)
                origins[0] = location.origin;
        } catch (err) {
            // Firefox (different domains CORS policy)
            origins[0] = '*'; // force any domain
        }
    }
    if (origins[origins.length - 1] == location.origin) {
        // same domain
        return undefined;
    } else {
        // different domains
        return origins[origins.length - 1] ? origins[origins.length - 1] + '/' : undefined;
    }
};

const console_log = function () {
    if (ENABLE_CONSOLE_LOGS) {
        console.log.apply(console, arguments);
    }
};

const getSourceFromStack = function () {
    const stack = new Error().stack.split('\n');
    stack.shift(); // remove our own intercepting functions from the stack
    stack.shift();
    const res = stack[1].match(STACK_LINE_REGEXP);
    return res ? res[2] : 'UNKNOWN_SOURCE';
};

const getTopics = function (response) {
    let topics = response.map(function (topic) {
        return taxonomy[topic.topic];
    });
    return topics;
};

const getArgs = function (args) {
    return [...args];
};

(function () {
    const interceptFunctionCall = function (elementType, funcName) {
        // save the original function using a closure
        console_log(`Intercepting ${elementType.name}.${funcName}`);
        const origFunc = elementType.prototype[funcName];
        // overwrite the object method with our own
        Object.defineProperty(elementType.prototype, funcName, {
            value: async function () {
                // execute the original function
                const retVal = await origFunc.apply(this, arguments);
                const calledFunc = `${elementType.name}.${funcName}`;
                // check and enforce the limits
                // increment the call countl init if needed
                accessCounts[calledFunc] = (accessCounts[calledFunc] || 0) + 1;
                const callCnt = accessCounts[calledFunc]; // just a shorthand
                if (callCnt >= MAX_NUM_CALLS_TO_INTERCEPT) {
                    console_log(`Reached max number of calls for ${calledFunc}: ${callCnt}`);
                    // revert the function to its original state
                    Object.defineProperty(elementType.prototype, funcName, {
                        value: function () {
                            return origFunc.apply(this, arguments);
                        },
                    });
                    return retVal;
                }
                // we still haven't reached the limit; we intercept the call
                console_log(`Intercepted call to ${calledFunc} ${callCnt} times`);
                const source = getSourceFromStack();
                const callDetails = {
                    args: getArgs(arguments),
                    topics: getTopics(retVal),
                    script: source,
                    website: frameUrl,
                    ancestor: getAncestor(),
                    timestamp: Date.now(),
                };

                // console_log(`Call Details: ${JSON.stringify(callDetails, null, 2)}`);
                // console.log('sending message to proxy: ', JSON.stringify(callDetails));

                var event = new CustomEvent('PassToBackground', {
                    detail: JSON.stringify(callDetails),
                });
                // send event to proxy in the context script
                window.dispatchEvent(event);
                return retVal;
            },
        });
    };

    // Topics API calls
    interceptFunctionCall(Document, 'browsingTopics');
})();
