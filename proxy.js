function connectToBackground() {
    const port = chrome.runtime.connect({
        name: 'inject_background',
    });

    port.onDisconnect.addListener(function () {
        // Handle disconnection by creating a new port
        console.log('Port disconnected. Creating a new port at ', new Date(Date.now()).toLocaleString());
        connectToBackground(); // Recursive call to create a new port
    });

    // Listen for the event in the injected script and send it to the background script
    window.addEventListener(
        'PassToBackground',
        function (evt) {
            // console.log('proxying message from inject to background', evt.detail);
            port.postMessage({
                data: evt.detail,
            });
        },
        false,
    );
}

// Initial connection
connectToBackground();
