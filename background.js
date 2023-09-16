chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === 'inject_background');
    // console.log('waiting for data from the proxy');
    port.onMessage.addListener(function (msg) {
        if (msg.data !== null) {
            // console.log('got data from proxy', msg);
            let data = JSON.parse(msg.data);
            let key = JSON.stringify(data.ancestor ?? data.website);

            // get the entries related to your website
            chrome.storage.local.get(key).then((result) => {
                // if we have a new entry we create an array with that first element
                if (JSON.stringify(result) === '{}') {
                    let newArray = [];
                    newArray.push(data);
                    chrome.storage.local.set({[key]: JSON.stringify(newArray)}).then(() => {
                        // console.log('New value is set', JSON.stringify(newArray, null, 4));
                    });
                } else {
                    // otherwise we append the new data to the existing one
                    let entry = JSON.parse(result[key]);
                    let copy = [];
                    // legacy stuff, the og entry was just an object, REMOVE before proper reliese.
                    if (!Array.isArray(entry)) {
                        copy.push(entry);
                        copy.push(data);
                    } else {
                        copy = [...entry];
                        copy.push(data);
                    }
                    chrome.storage.local.set({[key]: JSON.stringify(copy)}).then(() => {
                        // console.log('Value is set', JSON.stringify(copy, null, 4));
                    });
                }
            });
        } else {
            console.log('got no data from proxy');
        }
    });
});
