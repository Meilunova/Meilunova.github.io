// 书签提取工具
// 用于从HTML书签文件中提取网站信息并生成JavaScript数据格式

class BookmarkExtractor {
  constructor() {
    this.categories = {
      '学习': ['学习', '教程', '英语', '编程', '算法', 'Java', 'Python', '代码'],
      '开发': ['开发', '前端', '后端', 'API', 'UI', 'CSS', 'Vue', '框架', '图标'],
      '娱乐': ['游戏', '动漫', '视频', 'Minecraft', 'B站', '哔哩', '二次元', '娱乐'],
      '工具': ['工具', 'AI', '转换', 'Excel', 'PPT', '图床', '测试', '绘图', '白板'],
      '资源': ['资源', '软件', '音乐', '下载', '素材', '图片', '壁纸', '免费']
    };
  }

  // 从HTML书签文件解析数据
  parseBookmarkHTML(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const links = doc.querySelectorAll('a[href]');
    
    const extractedData = {};
    
    links.forEach(link => {
      const url = link.getAttribute('href');
      const name = link.textContent.trim();
      const icon = link.getAttribute('icon') || '';
      
      if (!url || !name || url.startsWith('javascript:')) return;
      
      const category = this.categorizeLink(name, url);
      const description = this.generateDescription(name, url);
      const emoji = this.getEmojiForSite(name, url);
      const tags = this.generateTags(name, url, description);
      
      if (!extractedData[category]) {
        extractedData[category] = {
          icon: this.getCategoryIcon(category),
          title: this.getCategoryTitle(category),
          sites: []
        };
      }
      
      extractedData[category].sites.push({
        name: name,
        description: description,
        url: url,
        icon: emoji,
        tags: tags
      });
    });
    
    return extractedData;
  }

  // 智能分类
  categorizeLink(name, url) {
    const text = (name + ' ' + url).toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categories)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    
    // 根据域名特征分类
    if (url.includes('github.com') || url.includes('api') || url.includes('dev')) {
      return '开发';
    }
    if (url.includes('music') || url.includes('video') || url.includes('download')) {
      return '资源';
    }
    if (url.includes('game') || url.includes('anime') || url.includes('bilibili')) {
      return '娱乐';
    }
    if (url.includes('tool') || url.includes('convert') || url.includes('online')) {
      return '工具';
    }
    
    return '工具'; // 默认分类
  }

  // 生成描述
  generateDescription(name, url) {
    const descriptions = {
      'github': '代码托管和协作平台',
      'bilibili': '视频分享平台',
      'youtube': '视频分享平台',
      'music': '音乐服务平台',
      'api': 'API接口服务',
      'tool': '在线工具',
      'download': '资源下载站',
      'free': '免费资源平台',
      'online': '在线服务',
      'editor': '在线编辑器',
      'converter': '格式转换工具'
    };
    
    const urlLower = url.toLowerCase();
    for (const [keyword, desc] of Object.entries(descriptions)) {
      if (urlLower.includes(keyword)) {
        return desc;
      }
    }
    
    // 根据名称生成描述
    if (name.includes('教程') || name.includes('学习')) {
      return '学习教程和资源';
    }
    if (name.includes('下载')) {
      return '资源下载服务';
    }
    if (name.includes('在线')) {
      return '在线工具服务';
    }
    
    return `${name}官方网站`;
  }

  // 获取网站表情符号
  getEmojiForSite(name, url) {
    const emojiMap = {
      'github': '🐙',
      'bilibili': '📺',
      'youtube': '📹',
      'music': '🎵',
      'api': '🔗',
      'tool': '🔧',
      'download': '⬇️',
      'free': '🆓',
      'online': '🌐',
      'editor': '✏️',
      'converter': '🔄',
      'game': '🎮',
      'anime': '🌸',
      'video': '🎬',
      'image': '🖼️',
      'design': '🎨',
      'code': '💻',
      'learn': '📚',
      'java': '☕',
      'python': '🐍',
      'css': '🎨',
      'javascript': '🟨',
      'vue': '💚',
      'react': '⚛️',
      'node': '💚',
      'minecraft': '🧱',
      'switch': '🎮',
      'ppt': '📊',
      'excel': '📊',
      'word': '📄',
      'pdf': '📄'
    };
    
    const text = (name + ' ' + url).toLowerCase();
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (text.includes(keyword)) {
        return emoji;
      }
    }
    
    return '🔗'; // 默认图标
  }

  // 生成标签
  generateTags(name, url, description) {
    const tags = [];
    const text = (name + ' ' + url + ' ' + description).toLowerCase();
    
    const tagKeywords = [
      '免费', '在线', '下载', '工具', '资源', '学习', '教程', '编程', '开发',
      '前端', '后端', 'API', 'UI', 'CSS', 'JavaScript', 'Vue', 'React',
      '游戏', '动漫', '视频', '音乐', '图片', '设计', '转换', '生成'
    ];
    
    tagKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // 添加网站名称作为标签
    tags.push(name);
    
    return tags.join(' ');
  }

  // 获取分类图标
  getCategoryIcon(category) {
    const icons = {
      '学习': '📚',
      '开发': '💻',
      '娱乐': '🎮',
      '工具': '🛠️',
      '资源': '📦'
    };
    return icons[category] || '🔗';
  }

  // 获取分类标题
  getCategoryTitle(category) {
    const titles = {
      '学习': '学习网站',
      '开发': '开发工具',
      '娱乐': '娱乐网站',
      '工具': '实用工具',
      '资源': '资源网站'
    };
    return titles[category] || '其他网站';
  }

  // 生成JavaScript代码
  generateJavaScript(data) {
    return `// 收藏夹网站数据
window.favoritesData = ${JSON.stringify(data, null, 2)};`;
  }

  // 从文件读取并处理
  async processBookmarkFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const htmlContent = e.target.result;
          const extractedData = this.parseBookmarkHTML(htmlContent);
          const jsCode = this.generateJavaScript(extractedData);
          resolve({
            data: extractedData,
            javascript: jsCode
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }
}

// 使用示例
/*
const extractor = new BookmarkExtractor();

// 处理文件
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await extractor.processBookmarkFile(file);
      console.log('提取的数据:', result.data);
      console.log('生成的JavaScript代码:', result.javascript);
      
      // 下载生成的JavaScript文件
      const blob = new Blob([result.javascript], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favorites-data.js';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('处理失败:', error);
    }
  }
});
*/

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarkExtractor;
} else {
  window.BookmarkExtractor = BookmarkExtractor;
}
