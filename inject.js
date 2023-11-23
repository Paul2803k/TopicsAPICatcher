import {taxonomy_v2} from './taxonomy.js';
// operational mode of the extention:
// SILENT: just record the api calls.
// BLOCK: record the api calls and return no topic to the caller.
// SCRAMBLE: record the api calls and return random topic from the taxonomy.

let MODE = 'SILENT';
let frameUrl = document.location.href;
let MAX_NUM_CALLS_TO_INTERCEPT = 1000;
let STACK_LINE_REGEXP = /(\()?(http[^)]+):[0-9]+:[0-9]+(\))?/;
let accessCounts = {}; // keep the access and call counts for each property and function
let ENABLE_CONSOLE_LOGS = true;

// TODO: for now only chrome, get rid of the firefox check.
const getAncestor = function () {
    let origins = location.ancestorOrigins;
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

// Debug log
const console_log = function () {
    if (ENABLE_CONSOLE_LOGS) {
        console.log.apply(console, arguments);
    }
};

// We throw an error and parses the resulting stack.
// this is to figure out where the topicApi call has been
// made.
const getSourceFromStack = function () {
    const stack = new Error().stack.split('\n');
    stack.shift(); // remove our own intercepting functions from the stack
    //console_log('stack: ', stack);
    stack.shift();
    const res = stack[1]?.match(STACK_LINE_REGEXP);
    return res ? res[2] : 'UNKNOWN_SOURCE';
};

// We map the index to a readable topic.
const getTopics = function (response) {
    return response.map(function (r) {
        return taxonomy_v2[r.topic];
    });
};

// Turns the arguments passed to the funtion into a readable state.
const getArgs = function (args) {
    let res = [];
    Object.keys(args).map(function (r) {
        res.push(JSON.stringify(args[r]));
    });
    return res;
};

// Retrieve "nTopics" random topics to pass to the caller.
const getRandomTopics = function (nTopics) {
    // TODO.
};

// Main intercept function.
(function () {
    const interceptFunctionCall = function (elementType, funcName) {
        // save the original function using a closure
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

                const source = getSourceFromStack();

                const callDetails = {
                    args: getArgs(arguments),
                    topics: getTopics(retVal),
                    script: source,
                    frame: frameUrl,
                    website: getAncestor(),
                    timestamp: Date.now(),
                };

                //console_log(callDetails);

                let event = new CustomEvent('PassToBackground', {
                    detail: JSON.stringify(callDetails),
                });

                window.dispatchEvent(event);

                switch (MODE) {
                    case 'BLOCK':
                        return []; // TODO: check return type.
                    case 'SCRAMBLE':
                        return getRandomTopics(3);
                    default:
                        return retVal;
                }
            },
        });
    };

    interceptFunctionCall(Document, 'browsingTopics');
})();
