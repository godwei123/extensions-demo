class NetworkMonitor {
    constructor() {
        this.requests = new Map();
        this.initializeListeners();
    }

    initializeListeners() {
        // 监听请求开始
        chrome.webRequest.onBeforeRequest.addListener(
            details => this.handleBeforeRequest(details),
            { urls: ['https://api.bilibili.com/*'] }
        );

        // 监听请求头
        chrome.webRequest.onSendHeaders.addListener(
            details => this.handleSendHeaders(details),
            { urls: ['https://api.bilibili.com/*'] },
            ['requestHeaders']
        );

        // 监听响应头
        chrome.webRequest.onResponseStarted.addListener(
            details => this.handleResponseStarted(details),
            { urls: ['https://api.bilibili.com/*'] },
            ['responseHeaders']
        );

        // 监听请求完成
        chrome.webRequest.onCompleted.addListener(details => this.handleCompleted(details), {
            urls: ['https://api.bilibili.com/*'],
        });

        // 监听请求错误
        chrome.webRequest.onErrorOccurred.addListener(details => this.handleError(details), {
            urls: ['https://api.bilibili.com/*'],
        });

        // 设置规则以捕获响应
        this.setupDeclarativeRules();
    }

    async setupDeclarativeRules() {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1],
            addRules: [
                {
                    id: 1,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        responseHeaders: [
                            {
                                header: 'Access-Control-Expose-Headers',
                                operation: 'set',
                                value: '*',
                            },
                        ],
                    },
                    condition: {
                        urlFilter: 'https://api.bilibili.com/*',
                        resourceTypes: ['xmlhttprequest'],
                    },
                },
            ],
        });
    }

    handleBeforeRequest(details) {
        const requestData = {
            id: details.requestId,
            url: details.url,
            method: details.method,
            type: details.type,
            timeStamp: details.timeStamp,
            status: 'pending',
            responseBody: null,
        };

        this.requests.set(details.requestId, requestData);
        this.saveToStorage();
    }

    handleSendHeaders(details) {
        const request = this.requests.get(details.requestId);
        if (request) {
            request.requestHeaders = details.requestHeaders;
            this.saveToStorage();
        }
    }

    handleResponseStarted(details) {
        const request = this.requests.get(details.requestId);
        if (request) {
            request.responseHeaders = details.responseHeaders;
            request.statusCode = details.statusCode;
            this.saveToStorage();
        }
    }

    handleCompleted(details) {
        const request = this.requests.get(details.requestId);
        if (request) {
            request.status = 'completed';
            request.timeEnd = details.timeStamp;
            request.duration = details.timeStamp - request.timeStamp;

            // 尝试获取响应内容
            if (details.type === 'xmlhttprequest') {
                this.fetchResponseContent(details.url)
                    .then(content => {
                        request.responseBody = content;
                        this.saveToStorage();
                    })
                    .catch(error => {
                        console.error('Error fetching response:', error);
                    });
            }

            this.saveToStorage();
        }
    }

    async fetchResponseContent(url) {
        try {
            const response = await fetch(url);
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('Error fetching response:', error);
            return null;
        }
    }

    handleError(details) {
        const request = this.requests.get(details.requestId);
        if (request) {
            request.status = 'error';
            request.error = details.error;
            this.saveToStorage();
        }
    }

    async saveToStorage() {
        const requestsArray = Array.from(this.requests.values());
        await chrome.storage.local.set({
            networkRequests: requestsArray.slice(-1000), // 只保存最近1000条记录
        });
    }

    clearRequests() {
        this.requests.clear();
        this.saveToStorage();
    }
}

// 初始化网络监控器
const monitor = new NetworkMonitor();
