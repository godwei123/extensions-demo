class CookieInspector {
    constructor() {
        this.cookiesList = document.getElementById('cookies-list');
        this.filterInput = document.getElementById('filter-input');
        this.refreshButton = document.getElementById('refresh-btn');

        this.init();
    }

    init() {
        // 添加事件监听器
        this.filterInput.addEventListener('input', () => this.handleFilter());
        this.refreshButton.addEventListener('click', () => this.loadCookies());

        // 初始加载cookies
        this.loadCookies();
    }

    async loadCookies() {
        try {
            // 获取当前标签页URL
            const url = await this.getCurrentTabUrl();
            if (!url) return;

            // 获取cookies
            const cookies = await chrome.cookies.getAll({ url });
            this.cookies = cookies;
            this.handleFilter(); // 应用当前过滤器
        } catch (error) {
            console.error('Error loading cookies:', error);
            this.showError();
        }
    }

    getCurrentTabUrl() {
        return new Promise(resolve => {
            chrome.devtools.inspectedWindow.eval('window.location.href', (result, isException) => {
                if (!isException && result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            });
        });
    }

    handleFilter() {
        const filterText = this.filterInput.value.toLowerCase();
        const filteredCookies = this.cookies.filter(
            cookie =>
                cookie.name.toLowerCase().includes(filterText) ||
                cookie.value.toLowerCase().includes(filterText) ||
                cookie.domain.toLowerCase().includes(filterText)
        );
        this.renderCookies(filteredCookies);
    }

    renderCookies(cookies) {
        this.cookiesList.innerHTML = '';

        if (!cookies.length) {
            this.showNoCookies();
            return;
        }

        cookies.forEach(cookie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.escapeHtml(cookie.name)}</td>
                <td class="cookie-value" title="${this.escapeHtml(cookie.value)}">
                    ${this.escapeHtml(cookie.value)}
                </td>
                <td>${this.escapeHtml(cookie.domain)}</td>
                <td>${this.escapeHtml(cookie.path)}</td>
                <td>${this.formatExpires(cookie.expirationDate)}</td>
                <td>${this.getCookieSize(cookie)}B</td>
                <td class="boolean-${cookie.httpOnly}">
                    ${cookie.httpOnly ? '✓' : '✗'}
                </td>
                <td class="boolean-${cookie.secure}">
                    ${cookie.secure ? '✓' : '✗'}
                </td>
                <td>${cookie.sameSite || 'None'}</td>
            `;

            this.cookiesList.appendChild(row);
        });
    }

    formatExpires(expirationDate) {
        if (!expirationDate) {
            return '<span class="expires-session">Session</span>';
        }
        return new Date(expirationDate * 1000).toLocaleString();
    }

    getCookieSize(cookie) {
        return cookie.name.length + cookie.value.length;
    }

    showNoCookies() {
        this.cookiesList.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px;">
                    No cookies found
                </td>
            </tr>
        `;
    }

    showError() {
        this.cookiesList.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px; color: #f44336;">
                    Error loading cookies
                </td>
            </tr>
        `;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new CookieInspector();
});
