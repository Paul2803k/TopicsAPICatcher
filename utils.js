// Function to format a timestamp
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
