var posts=["2025/10/20/评论系统优化与接入指南/","2025/07/25/anzhiyu-theme-advanced-customization/","2025/07/21/Hexo博客搭建完整指南：从零开始打造你的个人博客/","2025/07/21/hexo-anzhiyu-theme-tutorial/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };