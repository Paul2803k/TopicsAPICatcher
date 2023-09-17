// script.js
document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('menu');
    const hamburger = document.getElementById('menu__toggle');
    const iframe = document.getElementById('content-iframe');

    hamburger.addEventListener('click', () => {
        menu.classList.toggle('open');
        hamburger.classList.toggle('active');
    });

    function loadContent(option) {
        // Get the URL of the HTML file within the extension's directory
        const fileURL = chrome.runtime.getURL(option);

        // Load content into the iframe
        iframe.src = fileURL;

        menu.classList.remove('open'); // Close the menu after selecting an option
        hamburger.classList.remove('active'); // Change back to the hamburger icon

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
