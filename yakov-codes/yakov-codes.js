// Yakov Codes Page JavaScript - Masonry Gallery + Detail Mode
(function() {
    'use strict';

    // ========== 状态管理 ==========
    let currentMode = 'gallery'; // 'gallery' or 'detail'
    let currentCategory = 'all';
    let currentSubcategory = '';
    let searchQuery = '';
    let allAnimalsData = [];
    let currentDetailAnimal = null;
    let lastRenderedList = [];

    // ========== DOM 元素 ==========
    let searchInput;
    let clearSearchBtn;
    let filterContainer;
    let subFilterContainer;
    let galleryMode;
    let detailMode;
    let animalsMasonry;
    let animalsList;
    let detailPanelBody;
    let closeDetailBtn;
    let noResultsMessage;

    // ========== 初始化 ==========
    function init() {
        // 初始化 DOM 元素
        searchInput = document.getElementById('yakov-search-input');
        clearSearchBtn = document.getElementById('clear-search-btn');
        filterContainer = document.querySelector('.filter-container');
        subFilterContainer = document.querySelector('.sub-filter-container');
        galleryMode = document.querySelector('.gallery-mode');
        detailMode = document.querySelector('.detail-mode');
        animalsMasonry = document.querySelector('.animals-masonry');
        animalsList = document.querySelector('.animals-list');
        detailPanelBody = document.querySelector('.detail-panel-body');
        closeDetailBtn = document.querySelector('.close-detail-btn');
        noResultsMessage = document.querySelector('.no-results-message');

        // 检查必要元素
        if (!searchInput || !filterContainer || !animalsMasonry) {
            console.error('Required DOM elements not found');
            return;
        }

        // 检查数据
        if (typeof window.yakovAnimalsData === 'undefined') {
            showError('动物数据加载失败，请刷新页面重试。');
            return;
        }

        generateAllAnimalsData();
        renderMainFilters();
        renderGalleryCards();
        renderStatsCard();
        bindEvents();
    }

    // ========== 数据处理 ==========
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

    // 智能分类
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

    // 过滤数据
    function getFilteredAnimals() {
        let filtered = allAnimalsData;

        if (currentCategory !== 'all') {
            filtered = filtered.filter(item => item.categoryKey === currentCategory);
        }

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

    // ========== 渲染函数 ==========
    
    // 渲染主分类按钮
    function renderMainFilters() {
        let html = '<button class="filter-btn active" data-category="all">🌈 全部</button>';

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

    // 渲染画廊模式（瀑布流）
    function renderGalleryCards() {
        const filteredAnimals = getFilteredAnimals();
        lastRenderedList = filteredAnimals;

        if (filteredAnimals.length === 0) {
            animalsMasonry.innerHTML = '';
            noResultsMessage.style.display = 'block';
            return;
        }

        noResultsMessage.style.display = 'none';

        const cardsHTML = filteredAnimals.map((animal, index) => createMasonryCard(animal, index)).join('');
        animalsMasonry.innerHTML = cardsHTML;

        // 绑定卡片事件
        bindMasonryCardEvents();

        // 更新统计
        renderStatsCard();
    }

    // 创建瀑布流卡片
    function createMasonryCard(animal, index) {
        const tagsArr = String(animal.tags || '').split(' ').filter(Boolean);
        const tagsHTML = tagsArr.map(tag => `<span class="masonry-card-tag">${tag}</span>`).join('');

        return `
            <div class="masonry-card" data-animal-id="${animal.id}" data-index="${index}">
                <img src="${animal.image}" alt="${animal.name}" class="masonry-card-image" loading="lazy">
                <div class="masonry-card-info">
                    <div class="masonry-card-title">${animal.name}</div>
                    <div class="masonry-card-tags">${tagsHTML}</div>
                    <div class="masonry-card-actions">
                        <button class="masonry-card-btn masonry-card-btn-copy" data-action="copy">
                            <i class="fas fa-copy"></i> 复制
                        </button>
                        <button class="masonry-card-btn masonry-card-btn-detail" data-action="detail">
                            <i class="fas fa-eye"></i> 详情
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定瀑布流卡片事件
    function bindMasonryCardEvents() {
        animalsMasonry.querySelectorAll('.masonry-card').forEach(card => {
            const idxAttr = card.getAttribute('data-index');
            const idx = typeof idxAttr === 'string' ? parseInt(idxAttr, 10) : -1;
            let animal = (Number.isInteger(idx) && idx >= 0 && idx < lastRenderedList.length)
                ? lastRenderedList[idx]
                : null;
            if (!animal) {
                const animalId = card.getAttribute('data-animal-id');
                animal = allAnimalsData.find(a => String(a.id) === String(animalId));
            }
            
            if (!animal) return;

            // 复制按钮
            const copyBtn = card.querySelector('[data-action="copy"]');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyToClipboard(animal.code, copyBtn);
                });
            }

            // 详情按钮
            const detailBtn = card.querySelector('[data-action="detail"]');
            if (detailBtn) {
                detailBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    switchToDetailMode(animal);
                });
            }

            // 整个卡片点击也可以进入详情
            card.addEventListener('click', (e) => {
                e.preventDefault();
                switchToDetailMode(animal);
            });
        });
    }

    // 渲染统计卡片
    function renderStatsCard() {
        const statsEl = document.getElementById('yakov-stats-card');
        if (!statsEl) return;

        const totalAll = allAnimalsData.length;
        const filteredAnimals = getFilteredAnimals();
        const totalShown = filteredAnimals.length;

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

    // ========== 模式切换 ==========

    // 切换到详情模式
    function switchToDetailMode(animal) {
        if (!animal) return;
        
        currentMode = 'detail';
        currentDetailAnimal = animal;

        // 切换模式显示
        galleryMode.classList.remove('active');
        detailMode.classList.add('active');

        // 渲染详情模式的列表和详情
        renderDetailModeList();
        renderDetailPanel(animal);

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 滚动到当前选中的项目（使用更长的延迟确保DOM渲染完成）
        setTimeout(() => {
            const uid = getAnimalUID(animal);
            const activeItem = animalsList.querySelector(`.list-item-card[data-uid="${uid}"]`);
            if (activeItem) {
                // 确保active类已经添加
                activeItem.classList.add('active');
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200);
    }

    // 切换回画廊模式
    function switchToGalleryMode() {
        currentMode = 'gallery';
        currentDetailAnimal = null;

        // 切换模式显示
        detailMode.classList.remove('active');
        galleryMode.classList.add('active');
    }

    // 渲染详情模式的左侧列表
    function renderDetailModeList() {
        const filteredAnimals = getFilteredAnimals();

        const listHTML = filteredAnimals.map(animal => {
            const isActive = currentDetailAnimal && getAnimalUID(animal) === getAnimalUID(currentDetailAnimal);
            const uid = getAnimalUID(animal);
            return `
                <div class="list-item-card ${isActive ? 'active' : ''}" data-animal-id="${animal.id}" data-uid="${uid}">
                    <img src="${animal.image}" alt="${animal.name}" class="list-item-image">
                    <div class="list-item-info">
                        <div class="list-item-title">${animal.name}</div>
                        <div class="list-item-category">${animal.categoryTitle}</div>
                    </div>
                </div>
            `;
        }).join('');

        animalsList.innerHTML = listHTML;

        // 绑定列表项点击事件
        animalsList.querySelectorAll('.list-item-card').forEach(item => {
            const uid = item.getAttribute('data-uid');
            const animal = allAnimalsData.find(a => getAnimalUID(a) === uid);
            
            if (animal) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentDetailAnimal = animal;
                    renderDetailModeList(); // 重新渲染列表（更新高亮）
                    renderDetailPanel(animal); // 更新详情面板
                });
            }
        });
    }

    // 渲染右侧详情面板
    function renderDetailPanel(animal) {
        const tagsArr = String(animal.tags || '').split(' ').filter(Boolean);
        const tagsHTML = tagsArr.map(tag => `<span class="detail-tag">${tag}</span>`).join('');

        const detailHTML = `
            <div class="detail-content">
                <div class="detail-image-container">
                    <img src="${animal.image}" alt="${animal.name}" class="detail-image">
                </div>
                
                <h2 class="detail-title">${animal.name}</h2>
                
                <div class="detail-meta">
                    <span class="detail-category">${animal.categoryTitle}</span>
                </div>
                
                ${tagsHTML ? `
                <div class="detail-tags-container">
                    ${tagsHTML}
                </div>
                ` : ''}
                
                <div class="detail-code-section">
                    <div class="detail-code-header">
                        <h3 class="detail-code-title">捏脸代码</h3>
                        <button class="detail-copy-btn" data-code="${escapeHtml(animal.code)}" title="复制到剪贴板">
                            <i class="fas fa-copy"></i> 复制代码
                        </button>
                    </div>
                    <div class="detail-code-block">
                        <pre>${escapeHtml(animal.code)}</pre>
                    </div>
                </div>
                
                ${animal.sourceUrl ? `
                <div class="detail-source-link">
                    <a href="${animal.sourceUrl}" target="_blank" class="detail-source-btn">
                        <i class="fas fa-external-link-alt"></i> 查看原文链接
                    </a>
                </div>
                ` : ''}
            </div>
        `;

        detailPanelBody.innerHTML = detailHTML;

        // 绑定复制按钮
        const copyBtn = detailPanelBody.querySelector('.detail-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                copyToClipboard(animal.code, this);
            });
        }
    }

    // ========== 事件绑定 ==========
    function bindEvents() {
        // 搜索输入
        searchInput.addEventListener('input', debounce(function() {
            searchQuery = this.value.trim();
            clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            
            if (currentMode === 'gallery') {
                renderGalleryCards();
            } else {
                renderDetailModeList();
            }
        }, 300));

        // 清除搜索
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchQuery = '';
            this.style.display = 'none';
            
            if (currentMode === 'gallery') {
                renderGalleryCards();
            } else {
                renderDetailModeList();
            }
            
            searchInput.focus();
        });

        // 分类过滤
        filterContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-category');
            currentSubcategory = '';

            subFilterContainer.innerHTML = '';
            subFilterContainer.style.display = 'none';

            if (currentMode === 'gallery') {
                renderGalleryCards();
            } else {
                renderDetailModeList();
            }
        });

        // 关闭详情模式按钮
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => {
                switchToGalleryMode();
            });
        }
    }

    // ========== 工具函数 ==========

    // 复制到剪贴板
    function copyToClipboard(text, button) {
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

    // 降级复制方法
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

    // 显示复制成功反馈
    function showCopySuccess(button) {
        const originalHTML = button.innerHTML;
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i> 已复制！';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalHTML;
        }, 2000);
    }

    // 防抖
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

    // HTML 转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 为动物生成稳定唯一键（处理重复 id 的情况）
    function getAnimalUID(animal) {
        if (!animal) return '';
        const idPart = typeof animal.id === 'string' ? animal.id : String(animal.id || '');
        const namePart = typeof animal.name === 'string' ? animal.name : String(animal.name || '');
        return `${idPart}__${namePart}`;
    }

    // 显示错误
    function showError(message) {
        animalsMasonry.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-color-tertiary);">${message}</div>`;
    }

    // ========== 启动 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
