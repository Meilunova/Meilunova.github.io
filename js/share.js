// Music Share Page JavaScript
(function() {
    'use strict';

    let currentCategory = 'all';
    let currentSubcategory = '';
    let searchQuery = '';
    let allMusicData = [];

    // DOM elements
    const searchInput = document.getElementById('music-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const filterContainer = document.querySelector('.filter-container');
    const subFilterContainer = document.querySelector('.sub-filter-container');
    const musicGrid = document.querySelector('.music-grid');
    const noResultsMessage = document.querySelector('.no-results-message');

    // Initialize the page
    function init() {
        if (typeof window.musicShareData === 'undefined') {
            showError('音乐数据加载失败，请刷新页面重试。');
            return;
        }

        generateAllMusicData();
        renderMainFilters();
        renderMusicCards();
        bindEvents();
    }

    // Generate flattened music data for search
    function generateAllMusicData() {
        allMusicData = [];
        const data = window.musicShareData;

        Object.keys(data).forEach(categoryKey => {
            const category = data[categoryKey];
            
            if (category.sites) {
                // Direct sites in main category
                category.sites.forEach(site => {
                    allMusicData.push({
                        ...site,
                        category: categoryKey,
                        subcategory: '',
                        categoryTitle: category.title
                    });
                });
            }

            if (category.subcategories) {
                // Sites in subcategories
                Object.keys(category.subcategories).forEach(subKey => {
                    const subcategory = category.subcategories[subKey];
                    if (subcategory.sites) {
                        subcategory.sites.forEach(site => {
                            allMusicData.push({
                                ...site,
                                category: categoryKey,
                                subcategory: subKey,
                                categoryTitle: category.title,
                                subcategoryTitle: subcategory.title
                            });
                        });
                    }
                });
            }
        });
    }

    // Render main category filter buttons
    function renderMainFilters() {
        const data = window.musicShareData;
        let html = '<button class="filter-btn active" data-category="all"><span>🎶</span>全部</button>';

        Object.keys(data).forEach(key => {
            const category = data[key];
            if (key !== 'all') {
                html += `<button class="filter-btn" data-category="${key}">
                    <span>${category.icon}</span>${category.title}
                </button>`;
            }
        });

        filterContainer.innerHTML = html;
    }

    // Render subcategory filter buttons
    function renderSubFilters(categoryKey) {
        const data = window.musicShareData;
        const category = data[categoryKey];

        if (!category || !category.subcategories) {
            subFilterContainer.innerHTML = '';
            subFilterContainer.style.display = 'none';
            return;
        }

        let html = '<button class="filter-btn active" data-subc[object Object]'
        
        Object.keys(category.subcategories).forEach(subKey => {
            const subcategory = category.subcategories[subKey];
            html += `<button class="filter-btn" data-subcategory="${subKey}">
                <span>${subcategory.icon}</span>${subcategory.title}
            </button>`;
        });

        subFilterContainer.innerHTML = html;
        subFilterContainer.style.display = 'block';
    }

    // Filter music data based on current filters and search
    function getFilteredMusic() {
        let filtered = allMusicData;

        // Filter by category
        if (currentCategory !== 'all') {
            filtered = filtered.filter(item => item.category === currentCategory);
        }

        // Filter by subcategory
        if (currentSubcategory) {
            filtered = filtered.filter(item => item.subcategory === currentSubcategory);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                return item.title.toLowerCase().includes(query) ||
                       item.artist.toLowerCase().includes(query) ||
                       item.album.toLowerCase().includes(query) ||
                       (item.description && item.description.toLowerCase().includes(query)) ||
                       (item.tags && item.tags.toLowerCase().includes(query));
            });
        }

        return filtered;
    }

    // Render music cards
    function renderMusicCards() {
        const filteredMusic = getFilteredMusic();

        if (filteredMusic.length === 0) {
            musicGrid.innerHTML = '';
            noResultsMessage.style.display = 'block';
            return;
        }

        noResultsMessage.style.display = 'none';
        
        const html = filteredMusic.map(music => createMusicCard(music)).join('');
        musicGrid.innerHTML = html;

        // Bind copy button events
        bindCopyEvents();
    }

    // Create individual music card HTML
    function createMusicCard(music) {
        const coverUrl = music.cover || 'https://i.ibb.co/xqHjVV3f/FEBE3368-A7-EBDAA592-C974-AC6-C63-A3-A8.webp';
        const tags = music.tags ? music.tags.split(' ').map(tag =>
            `<span class="music-tag" data-tag="${tag}">#${tag}</span>`
        ).join('') : '';

        const previewBtn = music.previewLink ?
            `<button class="play-btn" data-preview-url="${music.previewLink}">
                <i class="fas fa-play"></i> 预览
            </button>` : '';

        return `
            <div class="music-card" data-music-id="${music.title}">
                <img src="${coverUrl}" alt="${music.title}封面" class="music-cover"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPuaXoOWbvueJhzwvdGV4dD4KPC9zdmc+'">
                <div class="music-info">
                    <h3 class="music-title">${music.title}</h3>
                    <p class="music-artist-album">${music.artist} - ${music.album}</p>
                    ${music.description ? `<p class="music-description">${music.description}</p>` : ''}
                    <div class="quwenjian-details">
                        <div class="detail-item">
                            <label>取件码:</label>
                            <span class="retrieval-code">${music.retrievalCode}</span>
                            <button class="copy-btn" data-copy-text="${music.retrievalCode}" aria-label="复制取件码">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div class="detail-item">
                            <label>分享链接:</label>
                            <a href="${music.shareLink}" target="_blank" rel="noopener noreferrer" class="share-link">${music.shareLink}</a>
                            <button class="copy-btn" data-copy-text="${music.shareLink}" aria-label="复制分享链接">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    ${previewBtn}
                    <div class="music-tags">${tags}</div>
                </div>
            </div>
        `;
    }

    // Bind all event listeners
    function bindEvents() {
        // Search functionality
        searchInput.addEventListener('input', handleSearch);
        clearSearchBtn.addEventListener('click', clearSearch);

        // Filter buttons
        filterContainer.addEventListener('click', handleMainFilter);
        subFilterContainer.addEventListener('click', handleSubFilter);

        // Tag clicks
        musicGrid.addEventListener('click', handleTagClick);

        // Preview buttons
        musicGrid.addEventListener('click', handlePreviewClick);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }

    // Handle search input
    function handleSearch(e) {
        searchQuery = e.target.value.trim();
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        renderMusicCards();
    }

    // Clear search
    function clearSearch() {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderMusicCards();
    }

    // Handle main category filter
    function handleMainFilter(e) {
        if (!e.target.classList.contains('filter-btn')) return;

        const category = e.target.dataset.category;
        if (category === currentCategory) return;

        // Update active state
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => 
            btn.classList.remove('active'));
        e.target.classList.add('active');

        currentCategory = category;
        currentSubcategory = '';

        renderSubFilters(category);
        renderMusicCards();
    }

    // Handle subcategory filter
    function handleSubFilter(e) {
        if (!e.target.classList.contains('filter-btn')) return;

        const subcategory = e.target.dataset.subcategory;
        if (subcategory === currentSubcategory) return;

        // Update active state
        subFilterContainer.querySelectorAll('.filter-btn').forEach(btn => 
            btn.classList.remove('active'));
        e.target.classList.add('active');

        currentSubcategory = subcategory;
        renderMusicCards();
    }

    // Handle tag clicks
    function handleTagClick(e) {
        if (!e.target.classList.contains('music-tag')) return;

        const tag = e.target.dataset.tag;
        searchInput.value = tag;
        searchQuery = tag;
        clearSearchBtn.style.display = 'block';
        renderMusicCards();
    }

    // Handle preview button clicks
    function handlePreviewClick(e) {
        if (!e.target.closest('.play-btn')) return;

        const previewUrl = e.target.closest('.play-btn').dataset.previewUrl;
        if (previewUrl) {
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
        }
    }

    // Handle keyboard shortcuts
    function handleKeyboard(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        } else if (e.key === 'Escape') {
            if (document.activeElement === searchInput) {
                clearSearch();
                searchInput.blur();
            }
        }
    }

    // Bind copy button events
    function bindCopyEvents() {
        const copyBtns = musicGrid.querySelectorAll('.copy-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', handleCopy);
        });
    }

    // Handle copy functionality
    async function handleCopy(e) {
        const btn = e.currentTarget;
        const textToCopy = btn.dataset.copyText;

        try {
            await navigator.clipboard.writeText(textToCopy);
            showCopySuccess(btn);
        } catch (err) {
            // Fallback for older browsers
            fallbackCopy(textToCopy, btn);
        }
    }

    // Show copy success feedback
    function showCopySuccess(btn) {
        const icon = btn.querySelector('i');
        const originalClass = icon.className;
        
        icon.className = 'fas fa-check';
        btn.classList.add('copied');
        
        setTimeout(() => {
            icon.className = originalClass;
            btn.classList.remove('copied');
        }, 2000);
    }

    // Fallback copy method
    function fallbackCopy(text, btn) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showCopySuccess(btn);
        } catch (err) {
            console.error('复制失败:', err);
        }

        document.body.removeChild(textArea);
    }

    // Show error message
    function showError(message) {
        musicGrid.innerHTML = `<div class="error-message">${message}</div>`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
