// Listen for installation
chrome.runtime.onInstalled.addListener(function () {
    console.log('Extension installed');
    // Set up initial side panel
    chrome.sidePanel.setOptions({
        enabled: true,
        path: 'sidebar/sidebar.html',
    });
});

// Handle extension icon click
chrome.action.onClicked.addListener(tab => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});
