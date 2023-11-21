chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === 'inject_background');
    // Add a function to handle disconnection
    port.onDisconnect.addListener(function () {
        // Remove the message listener when the port is disconnected
        console.info('Proxy disconnected at: ', Date.now());
        port.onMessage.removeListener(handleMessage);
    });

    // Define a function to handle incoming messages
    function handleMessage(msg) {
        if (msg.data !== null) {
            let data = JSON.parse(msg.data);
            let key = JSON.stringify(data.ancestor ?? data.website);

            // get the entries related to your website
            chrome.storage.local.get(key).then((result) => {
                // if we have a new entry, create an array with that first element
                let newArray;
                if (JSON.stringify(result) === '{}') {
                    newArray = [data];
                } else {
                    // otherwise, append the new data to the existing one
                    let entry = JSON.parse(result[key]);
                    if (!Array.isArray(entry)) {
                        entry = [entry]; // Convert single entry to an array
                    }
                    newArray = [...entry, data];
                }

                // Update the local storage with the new data
                chrome.storage.local.set({[key]: JSON.stringify(newArray)}).then(() => {
                    // Update the badge text and color
                    chrome.action.setBadgeText({text: newArray.length > 99 ? '99+' : String(newArray.length)}); // Set badge text to the array length
                    chrome.action.setBadgeBackgroundColor({color: 'red'});
                });
            });
        } else {
            console.warn('No data from proxy');
        }
    }

    // Add the message listener
    port.onMessage.addListener(handleMessage);
});
