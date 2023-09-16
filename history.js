// Get the entries related to your website when opening the popup
chrome.storage.local.get(JSON.stringify(null)).then((result) => {
    console.log(result);
    //addToTable(parsedData.sort(x, (y) => x.website > y.website));
});
