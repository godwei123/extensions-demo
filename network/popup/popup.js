class NetworkViewer {
    constructor() {
        this.requestsList = document.getElementById('requests-list');
        this.detailsPanel = document.getElementById('request-details');
        this.filterInput = document.getElementById('filter-input');
        this.clearButton = document.getElementById('clear-btn');

        this.requests = [];
        this.filteredRequests = [];
        this.selectedRequestId = null;

        this.init();
    }

    async init() {
        // 加载请求数据
        await this.loadRequests();

        // 添加事件监听器
        this.filterInput.addEventListener('input', () => this.handleFilter());
        this.clearButton.addEventListener('click', () => this.handleClear());

        // 定期刷新数据
        setInterval(() => this.loadRequests(), 1000);
    }

    async loadRequests() {
        const data = await chrome.storage.local.get('networkRequests');
        this.requests = data.networkRequests || [];
        this.handleFilter(); // 应用当前过滤器
    }

    handleFilter() {
        const filterText = this.filterInput.value.toLowerCase();
        this.filteredRequests = this.requests.filter(request =>
            request.url.toLowerCase().includes(filterText)
        );
        this.renderRequestsList();
    }

    async handleClear() {
        await chrome.storage.local.set({ networkRequests: [] });
        this.requests = [];
        this.filteredRequests = [];
        this.renderRequestsList();
        this.renderDetails(null);
    }

    renderRequestsList() {
        this.requestsList.innerHTML = '';

        this.filteredRequests.forEach(request => {
            const item = document.createElement('div');
            item.className = `request-item ${
                request.id === this.selectedRequestId ? 'selected' : ''
            }`;

            const statusClass = this.getStatusClass(request.status);

            item.innerHTML = `
                <div class="request-url">${this.truncateUrl(request.url)}</div>
                <div class="request-info">
                    <span class="${statusClass}">${request.status}</span>
                    <span>${request.method}</span>
                    <span>${request.type}</span>
                    ${request.duration ? `<span>${Math.round(request.duration)}ms</span>` : ''}
                </div>
            `;

            item.addEventListener('click', () => {
                this.selectedRequestId = request.id;
                this.renderRequestsList();
                this.renderDetails(request);
            });

            this.requestsList.appendChild(item);
        });
    }

    renderDetails(request) {
        if (!request) {
            this.detailsPanel.innerHTML =
                '<div class="no-selection">Select a request to view details</div>';
            return;
        }

        this.detailsPanel.innerHTML = `
            <div class="detail-section">
                <h3>General</h3>
                <div class="detail-content">
                    URL: ${request.url}
                    Method: ${request.method}
                    Status: ${request.statusCode || 'N/A'}
                    Type: ${request.type}
                    Duration: ${request.duration ? Math.round(request.duration) + 'ms' : 'N/A'}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Request Headers</h3>
                <div class="detail-content">
                    ${this.formatHeaders(request.requestHeaders)}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Response Headers</h3>
                <div class="detail-content">
                    ${this.formatHeaders(request.responseHeaders)}
                </div>
            </div>
            
            ${
                request.error
                    ? `
                <div class="detail-section">
                    <h3>Error</h3>
                    <div class="detail-content error">
                        ${request.error}
                    </div>
                </div>
            `
                    : ''
            }
        `;
    }

    formatHeaders(headers) {
        if (!headers) return 'No headers';
        return headers.map(h => `${h.name}: ${h.value}`).join('\n');
    }

    truncateUrl(url) {
        const maxLength = 100;
        return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
    }

    getStatusClass(status) {
        switch (status) {
            case 'completed':
                return 'status-success';
            case 'error':
                return 'status-error';
            default:
                return 'status-pending';
        }
    }
}

// 初始化查看器
document.addEventListener('DOMContentLoaded', () => {
    new NetworkViewer();
});
