// this function inject the "inject" script into the page context
function injectScript(src) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    s.type = 'module';
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

// run
console.log('injecting script');
injectScript('inject.js');
console.log('script injected');
