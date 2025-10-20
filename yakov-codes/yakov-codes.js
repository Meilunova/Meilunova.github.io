// Yakov Codes Page JavaScript - Based on Music Share Design
(function() {
    'use strict';

    let currentCategory = 'all';
    let currentSubcategory = '';
    let searchQuery = '';
    let allAnimalsData = [];

    // Like storage
    const LIKES_STORAGE_KEY = 'yakovLikes.v1';
    const LIKED_SET_KEY = 'yakovLikedSet.v1';
    let likesMap = {};
    let likedSet = new Set();

    // DOM elements (will be initialized after DOM ready)
    let searchInput;
    let clearSearchBtn;
    let filterContainer;
    let subFilterContainer;
    let animalsGrid;
    let noResultsMessage;

    // Initialize the page
    function init() {
        // Initialize DOM elements
        searchInput = document.getElementById('yakov-search-input');
        clearSearchBtn = document.getElementById('clear-search-btn');
        filterContainer = document.querySelector('.filter-container');
        subFilterContainer = document.querySelector('.sub-filter-container');
        animalsGrid = document.querySelector('.animals-grid');
        noResultsMessage = document.querySelector('.no-results-message');

        // Check if elements exist
        if (!searchInput || !filterContainer || !animalsGrid) {
            console.error('Required DOM elements not found');
            return;
        }

        // Check if data is loaded
        if (typeof window.yakovAnimalsData === 'undefined') {
            showError('动物数据加载失败，请刷新页面重试。');
            return;
        }

        loadLikesFromStorage();
        generateAllAnimalsData();
        renderMainFilters();
        renderAnimalCards();
        bindEvents();
    }

    // Generate flattened animals data for search
    function generateAllAnimalsData() {
        allAnimalsData = window.yakovAnimalsData.map(animal => ({
            ...animal,
            category: '全部动物',
            tags: getAnimalTags(animal.name),
            likes: Number(likesMap[animal.id] || 0)
        }));
    }

    // Get tags based on animal name
    function getAnimalTags(name) {
        // 可爱风格标签（首个为所属分组名）
        const tagMap = {
            '战斗鸡': '小勇士 热血',
            '白羽鸡': '毛绒绒 温柔',
            '乌鸦': '小彩虹 酷酷',
            '大白鹅': '小水手 白色',
            '老鹰': '小勇士 勇猛',
            '猫头鹰': '毛绒绒 夜行',
            '鹦鹉': '小彩虹 多彩',
            '小鹦鹉': '小彩虹 可爱',
            '秃鹫': '小勇士 强壮',
            '傻咕咕': '小可爱 呆萌',
            '鹈鹕': '小水手 大嘴',
            '大嘴鸟': '小彩虹 大嘴',
            '企鹅': '小水手 极地',
            '海鸥': '小水手 海边',
            '小蓝鸟': '小彩虹 蓝色',
            '白眉': '小彩虹 特征',
            '团子鸟': '小可爱 团子'
        };
        return tagMap[name] || '小可爱';
    }

    // Render main category filter buttons
    function renderMainFilters() {
        let html = '<button class="filter-btn active" data-category="all"><span>🌈</span>全部</button>';

        // 更卡通可爱的分类
        const categories = {
            'fluffy':   { title: '毛绒绒', icon: '🧸' },
            'brave':    { title: '小勇士', icon: '🛡️' },
            'sailor':   { title: '小水手', icon: '⛵' },
            'rainbow':  { title: '小彩虹', icon: '🌈' },
            'cuties':   { title: '小可爱', icon: '💖' }
        };

        Object.keys(categories).forEach(key => {
            const category = categories[key];
            html += `<button class="filter-btn" data-category="${key}">
                <span>${category.icon}</span>${category.title}
            </button>`;
        });

        filterContainer.innerHTML = html;
    }

    // Filter animals data based on current filters and search
    function getFilteredAnimals() {
        let filtered = allAnimalsData;

        // Filter by category
        if (currentCategory !== 'all') {
            const categoryMap = {
                'fluffy':  ['白羽鸡', '猫头鹰', '团子鸟'],
                'brave':   ['战斗鸡', '老鹰', '秃鹫'],
                'sailor':  ['大白鹅', '鹈鹕', '企鹅', '海鸥'],
                'rainbow': ['鹦鹉', '小鹦鹉', '大嘴鸟', '小蓝鸟'],
                'cuties':  ['傻咕咕', '团子鸟', '小蓝鸟']
            };
            
            const allowedNames = categoryMap[currentCategory] || [];
            filtered = filtered.filter(item => allowedNames.includes(item.name));
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                return item.name.toLowerCase().includes(query) ||
                       item.id.toLowerCase().includes(query) ||
                       (item.tags && item.tags.toLowerCase().includes(query));
            });
        }

        return filtered;
    }

    // Render animal cards
    function renderAnimalCards() {
        const filteredAnimals = getFilteredAnimals();

        if (filteredAnimals.length === 0) {
            animalsGrid.innerHTML = '';
            noResultsMessage.style.display = 'block';
            return;
        }

        noResultsMessage.style.display = 'none';

        const cardsHTML = filteredAnimals.map(animal => createAnimalCard(animal)).join('');
        animalsGrid.innerHTML = cardsHTML;

        // Bind copy and expand buttons
        bindCardButtons();

        // 更新右侧统计
        renderStatsCard(filteredAnimals);
        renderHotCard();
    }

    // Create a single animal card HTML
    function createAnimalCard(animal) {
        const tags = animal.tags.split(' ').map(tag => 
            `<span class="animal-tag">${tag}</span>`
        ).join('');

        const liked = likedSet.has(animal.id);
        return `
            <div class="animal-card" data-animal-id="${animal.id}">
                <img src="${animal.image}" alt="${animal.name}" class="animal-cover" loading="lazy">
                <div class="animal-info">
                    <h3 class="animal-title">${animal.name}</h3>
                    <p class="animal-id">#${animal.id}</p>

                    <button class="expand-btn" data-action="expand">
                        <i class="fas fa-chevron-down"></i> 查看完整代码
                    </button>

                    <div class="code-full">
                        <pre>${escapeHtml(animal.code)}</pre>
                    </div>

                    <div class="detail-item">
                        <button class="copy-btn" data-code="${escapeHtml(animal.code)}" title="复制代码">
                            <i class="fas fa-copy"></i> 复制代码
                        </button>
                        <button class="like-btn ${liked ? 'liked' : ''}" title="${liked ? '已点赞，点击取消' : '点赞此卡'}">
                            ❤ <span class="like-count">${Number(animal.likes || 0)}</span>
                        </button>
                        ${animal.sourceUrl ? `
                        <button class="source-btn" onclick="window.open('${animal.sourceUrl}', '_blank')" title="查看原文">
                            <i class="fas fa-external-link-alt"></i> 查看原文
                        </button>
                        ` : ''}
                    </div>

                    <div class="animal-tags">
                        ${tags}
                    </div>
                </div>
            </div>
        `;
    }

    // Bind copy and expand button events
    function bindCardButtons() {
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.animal-card');
                const pre = card ? card.querySelector('.code-full pre') : null;
                const code = pre ? pre.textContent : (this.getAttribute('data-code') || '');
                copyToClipboard(code, this);
            });
        });

        // Expand buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.animal-card');
                const codeBlock = card.querySelector('.code-full');
                const isExpanded = codeBlock.classList.contains('show');

                if (isExpanded) {
                    codeBlock.classList.remove('show');
                    this.innerHTML = '<i class="fas fa-chevron-down"></i> 查看完整代码';
                } else {
                    codeBlock.classList.add('show');
                    this.innerHTML = '<i class="fas fa-chevron-up"></i> 收起代码';
                }
            });
        });

        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.animal-card');
                if (!card) return;
                const id = card.getAttribute('data-animal-id');

                let current = Number(likesMap[id] || 0);
                if (likedSet.has(id)) {
                    // 取消点赞
                    current = Math.max(0, current - 1);
                    likesMap[id] = current;
                    likedSet.delete(id);
                    btn.classList.remove('liked');
                    btn.title = '点赞此卡';
                } else {
                    // 点赞
                    current = current + 1;
                    likesMap[id] = current;
                    likedSet.add(id);
                    btn.classList.add('liked');
                    btn.title = '已点赞，点击取消';
                }

                saveLikesToStorage();

                const cnt = btn.querySelector('.like-count');
                if (cnt) cnt.textContent = String(current);

                const found = allAnimalsData.find(a => a.id === id);
                if (found) found.likes = current;

                renderHotCard();
            });
        });
    }

    // Copy to clipboard
    function copyToClipboard(text, button) {
        // Decode HTML entities
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const decodedText = tempDiv.textContent || tempDiv.innerText;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(decodedText).then(() => {
                showCopySuccess(button);
            }).catch(() => {
                fallbackCopy(decodedText, button);
            });
        } else {
            fallbackCopy(decodedText, button);
        }
    }

    // Fallback copy method
    function fallbackCopy(text, button) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showCopySuccess(button);
        } catch (err) {
            console.error('复制失败:', err);
        }
        
        document.body.removeChild(textarea);
    }

    // Show copy success feedback
    function showCopySuccess(button) {
        const originalHTML = button.innerHTML;
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i> 已复制！';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalHTML;
        }, 2000);
    }

    // Likes storage helpers
    function loadLikesFromStorage() {
        try {
            likesMap = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) || '{}');
        } catch { likesMap = {}; }
        try {
            const arr = JSON.parse(localStorage.getItem(LIKED_SET_KEY) || '[]');
            likedSet = new Set(Array.isArray(arr) ? arr : []);
        } catch { likedSet = new Set(); }
    }

    function saveLikesToStorage() {
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likesMap));
        localStorage.setItem(LIKED_SET_KEY, JSON.stringify(Array.from(likedSet)));
    }

    // Bind events
    function bindEvents() {
        // Search input
        searchInput.addEventListener('input', debounce(function() {
            searchQuery = this.value.trim();
            clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            renderAnimalCards();
        }, 300));

        // Clear search button
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchQuery = '';
            this.style.display = 'none';
            renderAnimalCards();
            searchInput.focus();
        });

        // Filter buttons
        filterContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            // Update active state
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update category
            currentCategory = btn.getAttribute('data-category');
            currentSubcategory = '';

            // Hide subcategory filters
            subFilterContainer.innerHTML = '';
            subFilterContainer.style.display = 'none';

            // Render cards
            renderAnimalCards();
        });

        // Tag click to search
        animalsGrid.addEventListener('click', function(e) {
            if (e.target.classList.contains('animal-tag')) {
                const tagText = e.target.textContent.trim();
                searchInput.value = tagText;
                searchQuery = tagText;
                clearSearchBtn.style.display = 'block';
                renderAnimalCards();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // 渲染右侧统计卡片
    function renderStatsCard(currentList) {
        const statsEl = document.getElementById('yakov-stats-card');
        if (!statsEl) return;

        const totalAll = allAnimalsData.length;
        const totalShown = currentList.length;

        const groups = {
            '毛绒绒': ['白羽鸡', '猫头鹰', '团子鸟'],
            '小勇士': ['战斗鸡', '老鹰', '秃鹫'],
            '小水手': ['大白鹅', '鹈鹕', '企鹅', '海鸥'],
            '小彩虹': ['鹦鹉', '小鹦鹉', '大嘴鸟', '小蓝鸟'],
            '小可爱': ['傻咕咕', '团子鸟', '小蓝鸟']
        };

        const counts = Object.entries(groups).map(([label, names]) => {
            const count = allAnimalsData.filter(a => names.includes(a.name)).length;
            return { label, count };
        });

        const listHtml = counts.map(c => `<li><span>${c.label}</span><span>${c.count}</span></li>`).join('');

        statsEl.innerHTML = `
            <h4>📊 本页统计</h4>
            <div class="stats-total"><span>总计</span><span>${totalAll}</span></div>
            <ul class="stats-list">${listHtml}</ul>
            <div class="stats-total" style="margin-top:10px"><span>当前显示</span><span>${totalShown}</span></div>
        `;
    }

    // 渲染热门排行榜（按点赞）
    function renderHotCard() {
        const hotEl = document.getElementById('yakov-hot-card');
        if (!hotEl) return;

        const ranked = allAnimalsData
            .map(a => ({ id: a.id, name: a.name, likes: Number(likesMap[a.id] || 0) }))
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 6);

        const items = ranked.map((r, idx) => `
            <li data-id="${r.id}"><span>${idx + 1}. ${r.name}</span><span>❤ ${r.likes}</span></li>
        `).join('');

        hotEl.innerHTML = `
            <h4>🔥 热门排行</h4>
            <ul class="stats-list hot-list">${items}</ul>
        `;

        hotEl.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const id = li.getAttribute('data-id');
                const card = document.querySelector(`.animal-card[data-animal-id="${id}"]`);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show error message
    function showError(message) {
        animalsGrid.innerHTML = `<div class="loading">${message}</div>`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
