// This function inject the "inject" script into the page context
function injectScript(src) {
    // Check if the script is already injected
    if (!document.getElementById('inject_topics_api_script')) {
        // Create and inject the script
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL(src);
        s.type = 'module';
        s.id = 'inject_topics_api_script';

        const currentDocumentUrl = window.location.href;
        const currentDocumentTitle = document.title;
        console.info(`Injecting script into document: ${currentDocumentTitle} (${currentDocumentUrl})`);

        s.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    } else {
        console.warn('Script already injected');
    }
}

// Run
injectScript('inject.js');
