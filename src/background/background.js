import {domainsMap} from '../utils/domains_map.js';
import {getRootDomain} from '../utils/utils.js';

chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === 'inject_background');
    // Add a function to handle disconnection
    port.onDisconnect.addListener(function () {
        // Remove the message listener when the port is disconnected
        console.info('Proxy disconnected at: ', Date.now());
        port.onMessage.removeListener(handleMessage);
    });

    // Define a function to handle incoming messages
    function handleMessage(msg, senderData) {
        if (msg.data !== null) {
            let data = JSON.parse(msg.data);
            let url = new URL(data.website ?? data.frame).hostname;
            let domain = getRootDomain(data.frame);
            let company = domainsMap[domain]?.entityName;
            let key = JSON.stringify(url, company);
            // get the entries related to your website
            chrome.storage.local.get(key).then((result) => {
                // if we have a new entry, create an array with that first element
                let newArray;
                if (JSON.stringify(result) === '{}') {
                    newArray = [{...data, company: company}];
                } else {
                    // otherwise, append the new data to the existing one
                    let entry = JSON.parse(result[key]);
                    if (!Array.isArray(entry)) {
                        entry = [entry]; // Convert single entry to an array
                    }
                    newArray = [...entry, {...data, company: company}];
                }

                chrome.storage.local.set({[key]: JSON.stringify(newArray)}).then(() => {
                    // console.log(senderData?.sender);
                    // Update the badge text and color depending on the sender.
                    chrome.action.setBadgeText({
                        text: newArray.length > 99 ? '99+' : String(newArray.length),
                        tabId: senderData?.sender?.tab?.id,
                    }); // Set badge text to the array length
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
