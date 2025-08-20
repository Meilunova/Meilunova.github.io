var posts=["2025/07/21/Hexo博客搭建完整指南：从零开始打造你的个人博客/","2025/07/21/hexo-anzhiyu-theme-tutorial/","2025/01/20/anzhiyu-theme-advanced-customization/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };