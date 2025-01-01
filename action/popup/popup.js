class PageInfo {
    constructor() {
        this.elements = {
            title: document.getElementById('page-title'),
            url: document.getElementById('page-url'),
            protocol: document.getElementById('page-protocol'),
            domain: document.getElementById('page-domain'),
            lastUpdated: document.getElementById('page-last-updated'),
        };

        this.init();
    }

    async init() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];

            if (currentTab) {
                this.updatePageInfo(currentTab);
            }
        } catch (error) {
            console.error('Error getting tab information:', error);
        }
    }

    updatePageInfo(tab) {
        // Update title
        this.elements.title.textContent = tab.title || 'No title';

        // Create URL object for parsing
        const url = new URL(tab.url);

        // Update URL
        this.elements.url.textContent = tab.url;

        // Update protocol
        this.elements.protocol.textContent = url.protocol.replace(':', '');

        // Update domain
        this.elements.domain.textContent = url.hostname;

        // Update last updated time
        this.elements.lastUpdated.textContent = new Date().toLocaleString();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PageInfo();
});
