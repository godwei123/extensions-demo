class BookmarkManager {
    constructor() {
        this.bookmarksList = document.getElementById('bookmarks-list');
        this.searchInput = document.getElementById('search-input');
        this.currentFolder = null;

        this.init();
    }

    async init() {
        // 添加搜索监听器
        this.searchInput.addEventListener('input', () => this.handleSearch());

        // 加载书签
        await this.loadBookmarks();
    }

    async loadBookmarks(folderId = null) {
        try {
            this.currentFolder = folderId;
            const bookmarks = await chrome.bookmarks.getChildren(folderId || '1');
            this.renderBookmarks(bookmarks);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            this.showError();
        }
    }

    renderBookmarks(bookmarks) {
        this.bookmarksList.innerHTML = '';

        if (this.currentFolder) {
            this.addBackButton();
        }

        if (!bookmarks.length) {
            this.showNoBookmarks();
            return;
        }

        bookmarks.forEach(bookmark => {
            const item = document.createElement('div');

            if (bookmark.url) {
                // 这是一个书签
                item.className = 'bookmark-item';
                item.innerHTML = `
                    <div class="bookmark-title">${this.escapeHtml(bookmark.title)}</div>
                    <div class="bookmark-url">${this.escapeHtml(bookmark.url)}</div>
                `;
                item.addEventListener('click', () => window.open(bookmark.url, '_blank'));
            } else {
                // 这是一个文件夹
                item.className = 'bookmark-item folder-item';
                item.innerHTML = `
                    <div class="bookmark-title">📁 ${this.escapeHtml(bookmark.title)}</div>
                `;
                item.addEventListener('click', () => this.loadBookmarks(bookmark.id));
            }

            this.bookmarksList.appendChild(item);
        });
    }

    addBackButton() {
        const backButton = document.createElement('div');
        backButton.className = 'bookmark-item folder-item';
        backButton.innerHTML = '<div class="bookmark-title">⬅️ Back</div>';
        backButton.addEventListener('click', () => this.loadBookmarks());
        this.bookmarksList.appendChild(backButton);
    }

    showNoBookmarks() {
        this.bookmarksList.innerHTML = `
            <div class="no-bookmarks">
                No bookmarks found
            </div>
        `;
    }

    showError() {
        this.bookmarksList.innerHTML = `
            <div class="no-bookmarks">
                Error loading bookmarks
            </div>
        `;
    }

    async handleSearch() {
        const query = this.searchInput.value.toLowerCase();

        if (!query) {
            await this.loadBookmarks(this.currentFolder);
            return;
        }

        const results = await chrome.bookmarks.search(query);
        this.renderBookmarks(results);
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

// 初始化书签管理器
document.addEventListener('DOMContentLoaded', () => {
    new BookmarkManager();
});
