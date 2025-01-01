// Listen for installation
chrome.runtime.onInstalled.addListener(function () {
    console.log('Extension installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Message received:', request);
    // Handle messages here
    sendResponse({ status: 'success' });
    return true; // Will respond asynchronously
});
