// this will be run when the popup opens.
// it will request data about calls for that particular page and
// Get the current active tab in the lastly focused window

// add data to the main table
function addToTable(parsedData) {
    // Find a <table> element with id="keywords":
    var table = document.getElementById('keywords');

    // loop over the entries and load them into the table
    parsedData.forEach((element, index) => {
        // legacy for one random element
        let data = Array.isArray(element) ? element[0] : element;

        // Create an empty <tr> element and add it to the 1st position of the table:
        var row = table.insertRow(1);

        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var nr = row.insertCell(0);
        var topics = row.insertCell(1);
        var source = row.insertCell(2);
        var website = row.insertCell(3);
        var args = row.insertCell(4);
        var timestamp = row.insertCell(5);

        // Add data to the new cells:
        nr.innerHTML = JSON.stringify(table.rows.length - 2);
        topics.innerHTML = JSON.stringify(data?.topics, null, 3);
        source.innerHTML = JSON.stringify(data?.script);
        website.innerHTML = JSON.stringify(data?.website);
        args.innerHTML = JSON.stringify(data?.args);
        timestamp.innerHTML = JSON.stringify(new Date(data?.timestamp).toString());
    });
}

chrome.tabs.query(
    {
        active: true,
        lastFocusedWindow: true,
    },
    function (tabs) {
        // and use that tab to fill in out title and url
        var tab = tabs[0].url;

        // Get the entries related to your website when opening the popup
        chrome.storage.local.get(JSON.stringify(tab)).then((result) => {
            let parsedData = JSON.parse(result[JSON.stringify(tab)]);
            addToTable(parsedData.slice(-10));
        });

        // add listener in case calls are made when the popup is open
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            // console.log(changes, namespace);
            let tabKey = JSON.stringify(tab);
            if (tabKey in changes) {
                let newValue = JSON.parse(changes[tabKey].newValue);
                // console.log('changes detected, new value: ', JSON.stringify(newValue, null, 4));
                addToTable([newValue[newValue.length - 1]]);
            }
        });
    },
);
