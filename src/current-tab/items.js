import {
    formatTimestamp,
    toggleSortOrder,
    handleItemClick,
    isValidUrl,
    getStorageKey,
    formatLink,
} from '../utils/utils.js';

// Define a variable to track the current sort order
let currentSortOrder = 'desc';

// Add a global variable to track the number of items loaded
let numItemsLoaded = 0;

// Function to add a new item to the list
function addNewItem(element, direction) {
    const itemList = document.getElementById('item-list');
    const topics = element?.topics;
    const script = element?.script;
    const time = formatTimestamp(element?.timestamp);

    const row = document.createElement('li');
    row.classList.add('item-container');

    // Create the "Script" cell as a link
    const scriptCell = document.createElement('a');
    const scriptParse = script.replaceAll('"', '').split('/');
    scriptCell.classList.add('script-cell');
    scriptCell.innerText = element.company ?? scriptParse[scriptParse.length - 1];

    // Create the "Topics" cell
    const topicsCell = document.createElement('div');
    topicsCell.classList.add('topics-cell');
    topicsCell.innerText = topics.length === 0 ? 'None' : topics;

    // We create a link only if the script is actually a valid link
    if (isValidUrl(script.replaceAll('"', ''))) {
        scriptCell.classList.add('script-cell-link');
        scriptCell.href = script.replaceAll('"', ''); // Set the link URL
        scriptCell.title = script;
    }

    // Add event listener to prevent default action and open link in a new tab
    scriptCell.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(e.target.href, '_blank');
    });

    const itemWrapper = document.createElement('div');
    const timeCell = document.createElement('div');
    itemWrapper.classList.add('item-wrapper');
    timeCell.classList.add('time-cell');
    timeCell.innerText = time;

    // Add event listener to toggle details
    const arrow = document.createElement('img');
    arrow.classList.add('material-icons', 'arrow', 'arrow-rotate');
    arrow.src = chrome.runtime.getURL('material_icons/navigate_next_icon.svg'); // Use chrome.runtime.getURL to get the extension's path
    arrow.style.width = '18px'; // Adjust the width and height as needed
    arrow.style.height = '18px';
    arrow.title = 'Show/hide details.';

    arrow.addEventListener('click', () => {
        row.querySelector('.details-wrapper').classList.toggle('open');
        arrow.classList.toggle('rotate');
    });

    // Append cells and arrow to the wrapper
    itemWrapper.appendChild(topicsCell);
    itemWrapper.appendChild(scriptCell);
    itemWrapper.appendChild(timeCell);
    itemWrapper.appendChild(arrow);

    row.appendChild(itemWrapper);

    // Create details
    const detailsWrapper = document.createElement('div');
    const itemDetails = document.createElement('div');
    detailsWrapper.classList.add('details-wrapper');
    itemDetails.classList.add('details');
    detailsWrapper.appendChild(itemDetails);

    // Parse and format the JSON data as a dotted list
    const jsonData = element;
    const dottedListData = Object.keys(jsonData).map((key) => {
        let value = jsonData[key];
        let listItem = document.createElement('div');
        listItem.classList.add(key); // Add the bullet-point class
        let keyElement = document.createElement('b'); // Make the key element bold
        keyElement.textContent = `${key.replace(/^./, key[0].toUpperCase())}: `;
        listItem.appendChild(keyElement);
        if (isValidUrl(value)) {
            // Create link line
            const link = document.createElement('a');
            link.classList.add('line-link');
            link.innerText = formatLink(value);
            link.href = value; // Set the link URL
            link.title = 'Click to open in a new tab.';
            listItem.appendChild(link); // Append the value (not bold)
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(e.target.href, '_blank');
            });
            return listItem;
        }
        listItem.innerHTML += value; // Append the value (not bold)
        return listItem;
    });

    dottedListData.forEach((element) => {
        itemDetails.appendChild(element);
    });

    row.appendChild(detailsWrapper);

    // Append the row to the item list
    if (direction === 'before') {
        itemList.prepend(row);
    } else {
        itemList.append(row);
    }
}

// Function to add new items to the list
function addNewItems(parsedData, direction) {
    // Loop over the entries and load them into the table
    parsedData.forEach((element) => {
        // Legacy for one random element
        let data = Array.isArray(element) ? element[0] : element;
        addNewItem(data, direction);
    });
}

// Function to sort items based on the current sort order
function sortItemsHtml(sortBy) {
    // Toggle the sort order
    currentSortOrder = toggleSortOrder(currentSortOrder);

    let dir = currentSortOrder === 'asc' ? 1 : -1;

    // Get the item list
    const itemList = document.getElementById('item-list');
    // Get the item containers
    const items = Array.from(itemList.querySelectorAll('.item-container'));
    // Sort the items based on the selected field
    items.sort((a, b) => {
        const scriptA = a.querySelector('.script-cell').textContent;
        const scriptB = b.querySelector('.script-cell').textContent;
        const timeA = new Date(parseInt(a.querySelector('.timestamp').textContent.split(' ')[1]));
        const timeB = new Date(parseInt(b.querySelector('.timestamp').textContent.split(' ')[1]));

        if (sortBy === 'script') {
            return dir * scriptA.localeCompare(scriptB);
        } else if (sortBy === 'timestamp') {
            return dir * (timeA - timeB);
        }
        return 0;
    });

    // Reorder the sorted items in the item list
    items.forEach((item) => {
        itemList.appendChild(item);
    });
}

// Function to create and append the "Load More" button
function createLoadMoreButton() {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'load-more-btn';
    loadMoreBtn.textContent = 'Load More';
    loadMoreBtn.classList = 'load-more-button';
    loadMoreBtn.style.display = 'none';

    // Append the button after the list of items
    const itemList = document.getElementById('item-list');
    itemList.insertAdjacentElement('afterend', loadMoreBtn);

    return loadMoreBtn;
}

function handleLoadMore(loadMoreBtn, parsedData) {
    loadMoreBtn.addEventListener('click', () => {
        // Calculate the start index based on the number of items already loaded
        const startIndex = parsedData.length - numItemsLoaded;

        // Calculate the end index based on the start index and the number of items to add
        const endIndex = startIndex - 10;

        // Slice the data array to get the items to add
        const itemsToAdd = parsedData.slice(Math.max(endIndex, 0), startIndex);

        // Add the new items
        addNewItems(itemsToAdd.reverse(), 'after');

        // Update the number of items loaded
        numItemsLoaded += itemsToAdd.length;

        // Toggle the visibility of the load more button based on the remaining items
        loadMoreBtn.style.display = numItemsLoaded < parsedData.length ? 'block' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const itemContainers = document.querySelectorAll('.item-container');
    const arrows = document.querySelectorAll('.arrow');
    const details = document.querySelectorAll('.details');
    const scriptHeader = document.getElementById('script-header');
    const timeHeader = document.getElementById('time-header');
    const loadMoreBtn = createLoadMoreButton();
    // Toggle the details section when an item is clicked
    itemContainers.forEach((container, index) => {
        // Handle click event for each item header
        handleItemClick(index, details, arrows);
    });
    // Sorting buttons listeners
    scriptHeader.addEventListener('click', () => {
        sortItemsHtml('script');
    });

    timeHeader.addEventListener('click', () => {
        sortItemsHtml('timestamp');
    });

    // Get the current active tab to figure out which key to use
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        function (tabs) {
            // Check if tabs is empty or undefined
            if (tabs && tabs.length > 0) {
                // Get the active tab
                let tab = tabs[0].url;
                let tabKey = getStorageKey(tab);

                // Get the entries related to your website when opening the popup
                chrome.storage.local.get(tabKey).then((result) => {
                    if (!result || !result[tabKey]) {
                        console.info('Data not found in storage for this website:', JSON.stringify(result));
                        return;
                    }

                    try {
                        let parsedResult = JSON.parse(result[tabKey]);
                        let sliced = parsedResult.slice(-10);
                        numItemsLoaded = sliced.length;
                        loadMoreBtn.style.display = parsedResult.length > 10 ? 'block' : 'none';
                        // Only pass the last 10 results
                        addNewItems(sliced, 'before');
                        // Call the function to handle the "Load More" button
                        handleLoadMore(loadMoreBtn, parsedResult);
                    } catch (error) {
                        console.error('Error parsing website storage data:', error);
                    }
                });

                // Add a listener in case calls are made when the popup is open
                chrome.storage.onChanged.addListener(function (changes) {
                    if (tabKey in changes) {
                        try {
                            const newValue = JSON.parse(changes[tabKey].newValue);
                            addNewItems([newValue[newValue.length - 1]], 'before');
                        } catch (error) {
                            console.error('Error parsing changed data:', error);
                        }
                    }
                });
            } else {
                // Handle the case when there are no open tabs.
                console.error('No open tabs found. Close the dev inspector');
            }
        },
    );
});
