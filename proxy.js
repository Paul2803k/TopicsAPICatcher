var port = chrome.runtime.connect({
    name: 'inject_background',
});

// console.log('proxy started, waiting for message from inject');

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
