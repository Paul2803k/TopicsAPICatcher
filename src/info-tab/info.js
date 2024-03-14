document.addEventListener('DOMContentLoaded', function () {
    // Get all the entities from Chrome storage
    chrome.storage.local.get(null, function (result) {
        if (!result) {
            console.info('No data found in storage.');
            return;
        }

        // Initialize arrays to store unique topics and companies
        const uniqueTopics = [];
        const uniqueCompanies = [];

        // Loop through each key-value pair in the result
        for (const key in result) {
            if (Object.hasOwnProperty.call(result, key)) {
                const entities = JSON.parse(result[key]);

                // Extract topics and companies from each entity
                entities.forEach((entity) => {
                    // Extract and add topics
                    if (entity.topics && entity.topics.length > 0) {
                        entity.topics.forEach((topic) => {
                            if (!uniqueTopics.includes(topic)) {
                                uniqueTopics.push(topic);
                            }
                        });
                    }

                    // Extract and add companies
                    const company = entity.company;
                    if (company && !uniqueCompanies.includes(company)) {
                        uniqueCompanies.push(company);
                    }
                });
            }
        }

        // Sort unique topics and companies alphabetically
        uniqueTopics.sort();
        uniqueCompanies.sort();

        // Populate topics select
        const topicsSelect = document.getElementById('topics-select');
        uniqueTopics.forEach((topic) => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicsSelect.appendChild(option);
        });

        // Populate companies select
        const companiesSelect = document.getElementById('companies-select');
        uniqueCompanies.forEach((company) => {
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            companiesSelect.appendChild(option);
        });

        // Handle topic selection change
        topicsSelect.addEventListener('change', () => {
            const selectedTopic = topicsSelect.value;
            filterEntities(selectedTopic, companiesSelect.value);
        });

        // Handle company selection change
        companiesSelect.addEventListener('change', () => {
            const selectedCompany = companiesSelect.value;
            filterEntities(topicsSelect.value, selectedCompany);
        });
    });

    // Function to filter entities by topic and company
    function filterEntities(topic, company) {
        // Get the list to display filtered entities
        const filteredEntitiesList = document.getElementById('filtered-entities-companies');
        // Clear the list
        filteredEntitiesList.innerHTML = 'number of calls: ';

        // Loop through entities and filter based on topic and company
        for (const key in result) {
            if (Object.hasOwnProperty.call(result, key)) {
                const entities = JSON.parse(result[key]);

                entities.forEach((entity) => {
                    if ((!topic || entity.topics.includes(topic)) && (!company || entity.company === company)) {
                        const listItem = document.createElement('li');
                        listItem.textContent = `${entity.company} - ${entity.topics.join(', ')}`;
                        filteredEntitiesList.appendChild(listItem);
                    }
                });
            }
        }
    }
});
