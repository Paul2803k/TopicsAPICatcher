document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tablinks');
    const iframe = document.getElementById('content-iframe');

    // Get the current active tab to figure out which key to use
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        function (tabs) {
            // Reset the notification in the tab where we open the popup.
            chrome.action.setBadgeText({text: '', tabId: tabs[0].id});
        },
    );

    function loadContent(option) {
        if (typeof option !== 'string' || option.trim() === '') {
            console.error('Invalid option:', option);
            return;
        }
        // Get the URL of the HTML file within the extension's directory
        const fileURL = chrome.runtime.getURL(option + '.html');

        // Hide the iframe with a fade-out effect
        iframe.classList.add('hidden');

        // After a short delay, change the iframe source and show it with a fade-in effect
        setTimeout(() => {
            iframe.src = fileURL;
            iframe.classList.remove('hidden');
        }, 300); // Adjust the delay

        // Remove 'selected' class from all tabs
        tabs.forEach((tab) => tab.classList.remove('selected'));
        // Add 'selected' class to the clicked tab
        document.querySelector(`.tablinks[data-option="${option}"]`).classList.add('selected');
    }

    // Attach click event listeners to tabs
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const option = tab.getAttribute('data-option');
            loadContent(option);
        });
    });

    // Load the initial content
    loadContent('current-tab/items');
});
