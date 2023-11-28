import {getStorageKey} from './utils.js';

function getTitle(option, nEl) {
    if (option.includes('options')) {
        return 'Options';
    }
    if (option.includes('history')) {
        return 'History';
    }
    if (option.includes('items')) {
        return 'Total calls: ' + nEl;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('menu');
    const title = document.getElementById('title');
    const hamburger = document.getElementById('menu__toggle');
    const iframe = document.getElementById('content-iframe');
    let nEl = 0;

    title.innerText = getTitle(iframe.src, 0);

    // Get the current active tab to figure out which key to use
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        function (tabs) {
            // Reset the notification in the tab where we open the popup.
            chrome.action.setBadgeText({text: '', tabId: tabs[0].id});
            if (iframe.src.includes('items')) {
                // Check if tabs is empty or undefined
                if (tabs && tabs.length > 0) {
                    // Get the active tab
                    let tab = tabs[0].url;
                    let tabKey = getStorageKey(tab);

                    // Get the entries related to your website when opening the popup
                    chrome.storage.local.get(tabKey).then((result) => {
                        if (!result || !result[tabKey]) {
                            nEl = 0;
                            console.info('Data not found in storage for this website:', JSON.stringify(result));
                            return;
                        }

                        try {
                            let parsedResult = JSON.parse(result[tabKey]);
                            nEl = parsedResult.length;
                            title.innerText = getTitle(iframe.src, nEl);
                        } catch (error) {
                            nEl = 0;
                            console.error('Error parsing website storage data:', error);
                        }
                    });

                    // Add a listener in case calls are made when the popup is open
                    chrome.storage.onChanged.addListener(function (changes) {
                        if (tabKey in changes) {
                            try {
                                const newValue = JSON.parse(changes[tabKey].newValue);
                                nEl = newValue.length;
                                title.innerText = getTitle(iframe.src, nEl);
                            } catch (error) {
                                nEl = 0;
                                console.error('Error parsing changed data:', error);
                            }
                        }
                    });
                } else {
                    // Handle the case when there are no open tabs.
                    console.error('No open tabs found. Close the dev inspector');
                }
            }
        },
    );

    hamburger.addEventListener('click', () => {
        menu.classList.toggle('open');
    });

    function loadContent(option) {
        if (typeof option !== 'string' || option.trim() === '') {
            console.error('Invalid option:', option);
            return;
        }
        // Get the URL of the HTML file within the extension's directory
        const fileURL = chrome.runtime.getURL(option);

        // Hide the iframe with a fade-out effect
        iframe.classList.add('hidden');
        title.classList.add('hidden');
        // After a short delay, change the iframe source and show it with a fade-in effect
        setTimeout(() => {
            iframe.src = fileURL;
            title.innerText = getTitle(option, nEl);
            iframe.classList.remove('hidden');
            title.classList.remove('hidden');
        }, 300); // Adjust the delay

        menu.classList.remove('open'); // Close the menu after selecting an option

        // Uncheck the hamburger checkbox
        hamburger.checked = false;
    }

    // Attach click event listeners to menu items
    const menuItems = document.querySelectorAll('#menu ul li');

    menuItems.forEach((item) => {
        item.addEventListener('click', () => {
            const option = item.getAttribute('data-option');
            loadContent(option + '.html');
        });
    });
});
