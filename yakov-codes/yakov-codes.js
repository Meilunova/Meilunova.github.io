// Yakov Codes Page JavaScript - Based on Music Share Design
(function() {
    'use strict';

    let currentCategory = 'all';
    let currentSubcategory = '';
    let searchQuery = '';
    let allAnimalsData = [];


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

        generateAllAnimalsData();
        renderMainFilters();
        renderAnimalCards();
        bindEvents();
    }

    // Generate flattened animals data for search（带智能分类）
    function generateAllAnimalsData() {
        allAnimalsData = window.yakovAnimalsData.map(animal => {
            const c = classifyByName(animal.name);
            return {
                ...animal,
                categoryKey: c.categoryKey,
                categoryTitle: c.categoryTitle,
                tags: c.tags
            };
        });
    }

    // 智能分类：返回 { categoryKey, categoryTitle, tags }
    function classifyByName(name) {
        const n = (name || '').toLowerCase();

        const exactMap = {
            '坤坤': ['meme', '🎭 网络热梗', ['只因','坤坤']],
            'ikun': ['meme', '🎭 网络热梗', ['只因','粉丝']],
            '鸡你太妹': ['meme', '🎭 网络热梗', ['只因','梗']],
            '鸡你太没': ['meme', '🎭 网络热梗', ['只因','梗']],
            '歪嘴战神': ['meme', '🎭 网络热梗', ['表情包','魔性']],
            '歪嘴战神鸭': ['meme', '🎭 网络热梗', ['表情包','魔性']],
            '电眼逼人扁嘴伦': ['meme', '🎭 网络热梗', ['电眼','帅']],
            'among us小红人': ['acg', '🎮 动漫游戏', ['AmongUs','游戏']],
            '假面骑士鸭壳': ['acg', '🎮 动漫游戏', ['特摄','骑士']],
            'jojo-东方仗鸭': ['acg', '🎮 动漫游戏', ['JOJO','热血']],
            '奥特鸭': ['acg', '🎮 动漫游戏', ['奥特曼','特摄']],
            '高达鸭': ['acg', '🎮 动漫游戏', ['机甲','高达']],
            '初号鸭': ['acg', '🎮 动漫游戏', ['EVA','机甲']],
            '元气骑士机器人': ['acg', '🎮 动漫游戏', ['元气骑士','机器人']],
            '加藤惠宝宝': ['acg', '🎮 动漫游戏', ['动漫','加藤惠']],
            '黄晒儿的春丽': ['acg', '🎮 动漫游戏', ['街霸','春丽']],
            '鸭嘴兽泰瑞': ['acg', '🎮 动漫游戏', ['飞哥与小佛','特工']],
            '痞老板': ['acg', '🎮 动漫游戏', ['海绵宝宝','反派']],
            'aka痞老板（略有磨损）': ['acg', '🎮 动漫游戏', ['海绵宝宝','反派']],
            '小黄人鸭': ['acg', '🎮 动漫游戏', ['小黄人','电影']],
            '特异鸭士': ['cool', '😎 硬核酷炫', ['战斗','硬派']],
            '纽扣眼拳击手': ['cool', '😎 硬核酷炫', ['拳击','硬派']],
            '钢铁战斗鸡': ['cool', '😎 硬核酷炫', ['钢铁','战斗']],
            '战斗鸡': ['cool', '😎 硬核酷炫', ['战斗','热血']],
            '帅鸭': ['cool', '😎 硬核酷炫', ['帅','气场']],
            '帅': ['cool', '😎 硬核酷炫', ['帅','气场']],
            '聪明小鸡仔': ['cute', '💖 可爱萌物', ['聪明','小鸡']],
            '小黄鸭': ['cute', '💖 可爱萌物', ['经典','可爱']],
            '腮红鸭': ['cute', '💖 可爱萌物', ['腮红','软萌']],
            '小坤鸭': ['meme', '🎭 网络热梗', ['只因','坤坤']]
        };

        if (exactMap[name]) {
            const [k, t, extra] = exactMap[name];
            return { categoryKey: k, categoryTitle: t, tags: [t.replace(/^..\s/, ''), ...extra].join(' ') };
        }

        const rules = [
            { key: 'meme', title: '🎭 网络热梗', kws: ['坤','ikun','只因','小黑子','歪嘴','电眼','怎么说','看看','像谁','我就是个','我是谁'] },
            { key: 'acg', title: '🎮 动漫游戏', kws: ['奥特','假面','jojo','东方','高达','eva','机器人','元气骑士','海绵宝宝','泰瑞','春丽','小黄人','凤凰'] },
            { key: 'abstract', title: '🤪 抽象搞怪', kws: ['╮','（','）','随便名字','111','中分','方鸭','一只眼','三只眼','疑似','特异','潦草','嘿嘿','摇摇晃摇'] },
            { key: 'cute', title: '💖 可爱萌物', kws: ['小','萌','可爱','腮红','友好','小黄','小葵花','绿豆','小凤凰','小改','宝宝'] },
            { key: 'cool', title: '😎 硬核酷炫', kws: ['战斗','钢铁','光之','打人侠','拳击','无敌','电眼','能打','高贵','莫西干'] }
        ];

        for (const r of rules) {
            if (r.kws.some(k => n.includes(k.toLowerCase()))) {
                return { categoryKey: r.key, categoryTitle: r.title, tags: r.title.replace(/^..\s/, '') };
            }
        }

        const fallbackKws = ['鸡','鸭','鹅','鸟','鹦鹉','企鹅','猫头鹰','海鸥','鹈鹕','秃鹫','老鹰'];
        if (fallbackKws.some(k => (name || '').includes(k))) {
            return { categoryKey: 'cute', categoryTitle: '💖 可爱萌物', tags: '可爱 自然' };
        }

        return { categoryKey: 'abstract', categoryTitle: '🤪 抽象搞怪', tags: '抽象 创意' };
    }

    // Render main category filter buttons
    function renderMainFilters() {
        let html = '<button class="filter-btn active" data-category="all">🌈 全部</button>';

        // 新的五大分类
        const categories = {
            'meme':     { title: '🎭 网络热梗' },
            'acg':      { title: '🎮 动漫游戏' },
            'abstract': { title: '🤪 抽象搞怪' },
            'cute':     { title: '💖 可爱萌物' },
            'cool':     { title: '😎 硬核酷炫' }
        };

        Object.keys(categories).forEach(key => {
            const category = categories[key];
            html += `<button class="filter-btn" data-category="${key}">
                ${category.title}
            </button>`;
        });

        filterContainer.innerHTML = html;
    }

    // Filter animals data based on current filters and search
    function getFilteredAnimals() {
        let filtered = allAnimalsData;

        // Filter by category（使用分类键）
        if (currentCategory !== 'all') {
            filtered = filtered.filter(item => item.categoryKey === currentCategory);
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

    }

    // Create a single animal card HTML
    function createAnimalCard(animal) {
        const tags = String(animal.tags || '').split(' ').filter(Boolean).map(tag => 
            `<span class="animal-tag">${tag}</span>`
        ).join('');

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

        const groups = ['🎭 网络热梗','🎮 动漫游戏','🤪 抽象搞怪','💖 可爱萌物','😎 硬核酷炫'];

        const counts = groups.map(label => {
            const count = allAnimalsData.filter(a => a.categoryTitle === label).length;
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

