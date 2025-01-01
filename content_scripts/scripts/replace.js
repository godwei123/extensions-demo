class VueReplacer {
    constructor() {
        console.log('VueReplacer initialized');
        this.replacements = {
            vue: 'React',
            Vue: 'React',
            VUE: 'REACT',
        };

        this.init();
    }

    init() {
        if (document.body) {
            console.log('Body found, starting replacement');
            this.replaceInDocument();
            this.observeChanges();
        } else {
            console.log('Waiting for DOM content loaded');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM content loaded, starting replacement');
                this.replaceInDocument();
                this.observeChanges();
            });
        }
    }

    replaceInDocument() {
        console.log('Starting document replacement');
        this.findAndReplace(document.body);
        console.log('Document replacement completed');
    }

    findAndReplace(element) {
        // 跳过脚本和样式标签
        if (this.shouldSkipNode(element)) {
            return;
        }

        // 处理子节点
        const childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const node = childNodes[i];

            if (node.nodeType === 3) {
                // 文本节点
                this.replaceTextInNode(node);
            } else if (node.nodeType === 1) {
                // 元素节点
                // 替换属性值
                this.replaceAttributes(node);
                // 递归处理子元素
                this.findAndReplace(node);
            }
        }
    }

    replaceTextInNode(textNode) {
        let content = textNode.textContent;
        let hasChanges = false;

        // 应用所有替换
        Object.entries(this.replacements).forEach(([search, replace]) => {
            const regex = new RegExp(search, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, replace);
                hasChanges = true;
            }
        });

        // 只在有变化时更新节点
        if (hasChanges) {
            textNode.textContent = content;
        }
    }

    replaceAttributes(element) {
        // 替换标题、alt文本等属性
        const attributes = ['title', 'alt', 'placeholder', 'aria-label'];

        attributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                let value = element.getAttribute(attr);
                let hasChanges = false;

                Object.entries(this.replacements).forEach(([search, replace]) => {
                    const regex = new RegExp(search, 'g');
                    if (regex.test(value)) {
                        value = value.replace(regex, replace);
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    element.setAttribute(attr, value);
                }
            }
        });
    }

    shouldSkipNode(node) {
        // 跳过脚本、样式和特定的元素
        const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT'];
        return skipTags.includes(node.nodeName);
    }

    observeChanges() {
        // 创建 MutationObserver 来处理动态内容
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // 元素节点
                        this.findAndReplace(node);
                    }
                });
            });
        });

        // 开始观察
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
}

// 立即创建实例
console.log('Content script loaded');
new VueReplacer();
