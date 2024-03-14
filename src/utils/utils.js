// Validates URLs.
export function isValidUrl(string) {
    try {
        new URL(string.toString());
        return true;
    } catch (err) {
        return false;
    }
}

// Creates a key for the storage based on the url
export function getStorageKey(url) {
    if (isValidUrl(url)) {
        let key = new URL(url).hostname;
        return JSON.stringify(key);
    }
    return '';
}

export function formatLink(link) {
    if (link.length > 40) return link.substring(0, 40) + '...';
    return link;
}

// Function to format timestamps
export function formatTimestamp(timestamp) {
    const options = {
        hour: '2-digit', // Two-digit hour (e.g., 13)
        minute: '2-digit', // Two-digit minute (e.g., 34)
        second: '2-digit', // Two-digit second (e.g., 23)
        year: '2-digit', // Two-digit year (e.g., 23)
        month: '2-digit', // Two-digit month (e.g., 09)
        day: '2-digit', // Two-digit day (e.g., 28)
        hour12: false, // Use 24-hour format
    };

    const date = new Date(timestamp);
    return date.toLocaleString(new Intl.Locale('nl-NL'), options);
}

// Function to handle the click event for item headers
export function handleItemClick(index, details, arrows) {
    const itemHeader = document.querySelectorAll('.item-header')[index];
    itemHeader.addEventListener('click', () => {
        // Toggle the details section for the clicked item
        details[index].classList.toggle('open');
        arrows[index].classList.toggle('rotate');
    });
}

// Function to toggle the sort order
export function toggleSortOrder(currentSortOrder) {
    return currentSortOrder === 'asc' ? 'desc' : 'asc';
}

// Function to sort items based on key and dir
export function sortItemsBy(data, key, dir) {
    // Sort the items based on the selected field
    data.sort((a, b) => {
        if (key === 'script') {
            let scriptA = a.script;
            let scriptB = b.script;
            return dir * scriptA.localeCompare(scriptB);
        } else if (key === 'timestamp') {
            let timeA = a.timestamp;
            let timeB = b.timestamp;
            return dir * (timeA - timeB);
        } else if (key === 'website') {
            let webA = a.website ?? a.frame;
            let webB = b.website ?? b.frame;
            return dir * webA?.localeCompare(webB);
        }
        return 0;
    });
    return data;
}

// Function to get root domain out of a URL
// credits https://github.com/capturr/get-root-domain/blob/main/src/index.ts
export function getRootDomain(url) {
    if (typeof url === 'string') url = new URL(url);

    const domain = url.hostname;
    const elems = domain.split('.');
    const iMax = elems.length - 1;

    const elem1 = elems[iMax - 1];
    const elem2 = elems[iMax];

    const isSecondLevelDomain = iMax >= 3 && (elem1 + elem2).length <= 5;
    return (isSecondLevelDomain ? elems[iMax - 2] + '.' : '') + elem1 + '.' + elem2;
}
