/**
 * 收藏夹页面JavaScript逻辑
 * 负责页面交互、数据渲染和搜索功能
 */

// 收藏夹应用主类
class FavoritesApp {
  constructor() {
    this.searchInput = null;
    this.filterBtns = null;
    this.favoritesContent = null;
    this.subcategoryNav = null;
    this.subcategoryList = null;
    this.currentFilter = 'all';
    this.currentSubcategory = 'all';
    
    this.init();
  }
  
  // 初始化应用
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('收藏夹页面加载完成，开始初始化...');
      
      // 获取DOM元素
      this.initElements();
      
      if (!this.favoritesContent) {
        console.error('找不到 favorites-content 元素');
        return;
      }
      
      // 检查数据是否加载
      this.waitForData();
    });
  }
  
  // 初始化DOM元素
  initElements() {
    this.searchInput = document.getElementById('search-input');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.favoritesContent = document.getElementById('favorites-content');
    this.subcategoryNav = document.getElementById('subcategory-nav');
    this.subcategoryList = document.getElementById('subcategory-list');
  }
  
  // 等待数据加载
  waitForData() {
    if (typeof window.favoritesData !== 'undefined') {
      console.log('数据已加载:', Object.keys(window.favoritesData));
      this.setupEventListeners();
      this.renderWebsites('all', 'all');
    } else {
      console.log('等待数据加载...');
      setTimeout(() => this.waitForData(), 100);
    }
  }
  
  // 设置事件监听器
  setupEventListeners() {
    // 主分类按钮事件
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilterClick(e));
    });

    // 搜索功能
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }
  
  // 处理分类按钮点击
  handleFilterClick(e) {
    const btn = e.currentTarget;
    console.log('点击分类按钮:', btn.getAttribute('data-category'));
    
    this.filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    this.currentFilter = btn.getAttribute('data-category');
    this.currentSubcategory = 'all';
    const searchTerm = this.searchInput ? this.searchInput.value : '';
    
    if (this.currentFilter === 'all') {
      this.hideSubcategories();
      this.renderWebsites('all', 'all', searchTerm);
    } else {
      this.showSubcategories(this.currentFilter);
      this.renderWebsites(this.currentFilter, 'all', searchTerm);
    }
  }
  
  // 处理搜索
  handleSearch(e) {
    const searchTerm = e.target.value;
    this.renderWebsites(this.currentFilter, this.currentSubcategory, searchTerm);
  }
  
  // 处理键盘快捷键
  handleKeydown(e) {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (this.searchInput) {
        this.searchInput.focus();
        this.searchInput.select();
      }
    }
    
    // ESC 清空搜索
    if (e.key === 'Escape' && this.searchInput && document.activeElement === this.searchInput) {
      this.searchInput.value = '';
      this.renderWebsites(this.currentFilter, this.currentSubcategory, '');
    }
  }
  
  // 渲染网站内容
  renderWebsites(filter = 'all', subcategory = 'all', searchTerm = '') {
    console.log('开始渲染网站...', filter, subcategory, searchTerm);
    this.favoritesContent.innerHTML = '';
    
    let hasContent = false;
    
    Object.keys(window.favoritesData).forEach(categoryKey => {
      if (filter !== 'all' && filter !== categoryKey) return;
      
      const category = window.favoritesData[categoryKey];
      
      // 处理多级分类渲染逻辑
      if (category.subcategories) {
        Object.keys(category.subcategories).forEach(subKey => {
          if (subcategory !== 'all' && subcategory !== subKey) return;
          
          const subCategory = category.subcategories[subKey];
          
          // 如果子分类有网站，直接渲染
          if (subCategory.sites) {
            this.renderCategorySection(subCategory, `${categoryKey}-${subKey}`, searchTerm);
            hasContent = true;
          }
          
          // 如果子分类还有子分类，递归处理
          if (subCategory.subcategories) {
            Object.keys(subCategory.subcategories).forEach(subSubKey => {
              const subSubCategory = subCategory.subcategories[subSubKey];
              if (subSubCategory.sites) {
                this.renderCategorySection(subSubCategory, `${categoryKey}-${subKey}-${subSubKey}`, searchTerm);
                hasContent = true;
              }
            });
          }
        });
      } else if (category.sites) {
        this.renderCategorySection(category, categoryKey, searchTerm);
        hasContent = true;
      }
    });
    
    // 如果没有结果，显示提示
    if (this.favoritesContent.children.length === 0) {
      this.showNoResults();
    }
  }
  
  // 渲染分类区域
  renderCategorySection(category, categoryId, searchTerm = '') {
    if (!category.sites) return;
    
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    
    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'category-title';
    categoryTitle.innerHTML = `<span>${category.icon}</span> ${category.title}`;
    if (category.color) {
      categoryTitle.style.color = category.color;
    }
    
    const linksGrid = document.createElement('div');
    linksGrid.className = 'links-grid';
    
    let hasVisibleCards = false;
    
    category.sites.forEach((site, index) => {
      // 搜索过滤
      if (searchTerm && !this.matchesSearch(site, searchTerm)) return;
      
      hasVisibleCards = true;
      const linkCard = this.createLinkCard(site, index);
      linksGrid.appendChild(linkCard);
    });
    
    // 只有在有可见卡片时才添加分类区域
    if (hasVisibleCards) {
      categorySection.appendChild(categoryTitle);
      categorySection.appendChild(linksGrid);
      this.favoritesContent.appendChild(categorySection);
    }
  }
  
  // 创建链接卡片
  createLinkCard(site, index) {
    const linkCard = document.createElement('div');
    linkCard.className = 'link-card';
    linkCard.style.animationDelay = `${(index % 6) * 0.1}s`;
    
    linkCard.innerHTML = `
      <div class="card-icon">${site.icon}</div>
      <div class="card-content">
        <h3>${site.name}</h3>
        <p>${site.description}</p>
        <a href="${site.url}" target="_blank" class="card-link" rel="noopener noreferrer">访问</a>
      </div>
    `;
    
    return linkCard;
  }
  
  // 搜索匹配函数
  matchesSearch(site, searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    return site.name.toLowerCase().includes(term) ||
           site.description.toLowerCase().includes(term) ||
           (site.tags && site.tags.toLowerCase().includes(term));
  }
  
  // 显示子分类导航
  showSubcategories(categoryKey) {
    const category = window.favoritesData[categoryKey];
    if (!category || !category.subcategories) {
      this.hideSubcategories();
      return;
    }
    
    this.subcategoryList.innerHTML = '';
    
    // 添加"全部"按钮
    const allBtn = this.createSubcategoryBtn('all', '🌟', '全部', true);
    this.subcategoryList.appendChild(allBtn);
    
    // 添加子分类按钮
    Object.keys(category.subcategories).forEach(subKey => {
      const subCategory = category.subcategories[subKey];
      const btn = this.createSubcategoryBtn(subKey, subCategory.icon, subCategory.title, false);
      if (subCategory.color) {
        btn.style.borderColor = subCategory.color;
      }
      this.subcategoryList.appendChild(btn);
    });
    
    // 显示子分类导航
    this.subcategoryNav.style.display = 'block';
    
    // 绑定子分类按钮事件
    this.bindSubcategoryEvents();
  }
  
  // 创建子分类按钮
  createSubcategoryBtn(subcategory, icon, title, isActive = false) {
    const btn = document.createElement('button');
    btn.className = `subcategory-btn${isActive ? ' active' : ''}`;
    btn.setAttribute('data-subcategory', subcategory);
    btn.innerHTML = `<span>${icon}</span>${title}`;
    return btn;
  }
  
  // 隐藏子分类导航
  hideSubcategories() {
    if (this.subcategoryNav) {
      this.subcategoryNav.style.display = 'none';
    }
    this.currentSubcategory = 'all';
  }
  
  // 绑定子分类按钮事件
  bindSubcategoryEvents() {
    const subcategoryBtns = this.subcategoryList.querySelectorAll('.subcategory-btn:not(.back-btn)');
    
    subcategoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 更新激活状态
        subcategoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.currentSubcategory = btn.getAttribute('data-subcategory');
        const searchTerm = this.searchInput ? this.searchInput.value : '';
        
        this.renderWebsites(this.currentFilter, this.currentSubcategory, searchTerm);
      });
    });
    
    // 返回按钮事件
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // 重置到主分类
        this.hideSubcategories();
        const searchTerm = this.searchInput ? this.searchInput.value : '';
        this.renderWebsites(this.currentFilter, 'all', searchTerm);
      });
    }
  }
  
  // 显示无结果提示
  showNoResults() {
    this.favoritesContent.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--anzhiyu-secondtext);">
        <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
        <h3>没有找到相关内容</h3>
        <p>试试其他关键词或选择不同的分类</p>
      </div>
    `;
  }
}

// 初始化收藏夹应用
const favoritesApp = new FavoritesApp();
