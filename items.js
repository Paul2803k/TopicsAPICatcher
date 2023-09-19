// Function to format a timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(new Intl.Locale('nl-NL'));
}

// Define a variable to track the current sort order
let currentSortOrder = 'desc';

// Function to toggle the sort order
function toggleSortOrder() {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
}

// Function to add a new item to the list
function addNewItem(element) {
    // Find the item list
    const itemList = document.getElementById('item-list');

    const script = JSON.stringify(element?.script);
    const time = formatTimestamp(element?.timestamp);

    const row = document.createElement('li');
    row.classList.add('item-container');

    // Create the "Script" cell as a link
    const scriptCell = document.createElement('a');
    scriptCell.classList.add('script-cell');
    const scriptParse = script.replaceAll('"', '').split('/');
    scriptCell.innerText = scriptParse[scriptParse.length - 1];
    scriptCell.href = script.replaceAll('"', ''); // Set the link URL
    scriptCell.title = 'Click to open in a new tab.';

    // Add event listener to prevent default action and open link in a new tab
    scriptCell.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(e.target.href, '_blank');
    });

    const itemWrapper = document.createElement('div');
    itemWrapper.classList.add('item-wrapper');
    const timeCell = document.createElement('div');
    timeCell.classList.add('time-cell');
    timeCell.innerText = time;

    // Add event listener to toggle details
    const arrow = document.createElement('div');
    arrow.classList.add('arrow', 'arrow-toggle');
    arrow.innerText = '⮞';
    arrow.title = 'Show/hide details.';

    arrow.addEventListener('click', () => {
        row.querySelector('.details-wrapper').classList.toggle('open');
        arrow.classList.toggle('rotate');
    });

    // Append cells and arrow to the wrapper
    itemWrapper.appendChild(scriptCell);
    itemWrapper.appendChild(timeCell);
    itemWrapper.appendChild(arrow);

    row.appendChild(itemWrapper);

    // Create details
    const detailsWrapper = document.createElement('div');
    detailsWrapper.classList.add('details-wrapper');
    const itemDetails = document.createElement('div');
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
        listItem.innerHTML += value; // Append the value (not bold)
        return listItem;
    });

    dottedListData.forEach((element) => {
        itemDetails.appendChild(element);
    });

    row.appendChild(detailsWrapper);

    // Append the row to the item list
    itemList.prepend(row);
}

// Function to add new items to the list
function addNewItems(parsedData) {
    // Loop over the entries and load them into the table
    parsedData.forEach((element) => {
        // Legacy for one random element
        let data = Array.isArray(element) ? element[0] : element;
        addNewItem(data);
    });
}

// Function to sort items based on the current sort order
function sortItems(sortBy) {
    // Toggle the sort order
    toggleSortOrder();

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

// Function to handle the click event for item headers
function handleItemClick(index, details, arrows) {
    const itemHeader = document.querySelectorAll('.item-header')[index];
    itemHeader.addEventListener('click', () => {
        // Toggle the details section for the clicked item
        details[index].classList.toggle('open');
        arrows[index].classList.toggle('rotate');
        arrows[index].textContent = arrows[index].classList.contains('rotate') ? '▲' : '▼';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // JavaScript to toggle the details section when an item is clicked
    const itemContainers = document.querySelectorAll('.item-container');
    const arrows = document.querySelectorAll('.arrow');
    const details = document.querySelectorAll('.details');
    const scriptHeader = document.getElementById('script-header');
    const timeHeader = document.getElementById('time-header');

    itemContainers.forEach((container, index) => {
        // Handle click event for each item header
        handleItemClick(index, details, arrows);
    });

    scriptHeader.addEventListener('click', () => {
        sortItems('script');
    });

    timeHeader.addEventListener('click', () => {
        sortItems('timestamp');
    });

    chrome.tabs.query(
        {
            active: true,
            lastFocusedWindow: true,
        },
        function (tabs) {
            // Check if tabs is empty or undefined
            if (tabs && tabs.length > 0) {
                // Get the active tab
                var tab = tabs[0].url;

                // Get the entries related to your website when opening the popup
                chrome.storage.local.get(JSON.stringify(tab)).then((result) => {
                    let parsedData = JSON.parse(result[JSON.stringify(tab)]);
                    addNewItems(parsedData.slice(-10));
                    chrome.action.setBadgeText({text: ''});
                });

                // Add a listener in case calls are made when the popup is open
                chrome.storage.onChanged.addListener(function (changes) {
                    let tabKey = JSON.stringify(tab);
                    if (tabKey in changes) {
                        let newValue = JSON.parse(changes[tabKey].newValue);
                        addNewItems([newValue[newValue.length - 1]]);
                    }
                });
            } else {
                // Handle the case when there are no open tabs
                // You can display a message or take appropriate action here
                console.error('No open tabs found. CLose the dev inspector');
            }
        },
    );
});
