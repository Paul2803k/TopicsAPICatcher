document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('menu');
    const hamburger = document.getElementById('menu__toggle');
    const iframe = document.getElementById('content-iframe');

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

        // After a short delay, change the iframe source and show it with a fade-in effect
        setTimeout(() => {
            iframe.src = fileURL;
            iframe.classList.remove('hidden');
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
