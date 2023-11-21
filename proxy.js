// This script handles the events coming from the injected script.
// When an event is recieved, the script sends a message to the background script,
// This is because the context and background script cannot interact directly and send
// data to each other.

let port = null;

function connectToBackground() {
    if (port === null) {
        port = chrome.runtime.connect({
            name: 'inject_background',
        });

        port.onDisconnect.addListener(function () {
            // Handle disconnection by logging and setting the port to null
            console.info('Port disconnected at ', new Date(Date.now()).toLocaleString());
            port = null;

            // TODO:
            // The only reason why we would want to reconnect is that some website send the topics request
            // periodically, not sure how often that happens.
            connectToBackground();
        });

        // Listen for the event in the injected script and send it to the background script
        window.addEventListener(
            'PassToBackground',
            function (evt) {
                if (port) {
                    port.postMessage({
                        data: evt.detail,
                    });
                } else {
                    console.warn('No connection to background script.');
                }
            },
            false,
        );
    }
}

// Initial connection
connectToBackground();
