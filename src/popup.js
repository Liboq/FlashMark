import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

// Create and mount the Vue application
const app = createApp(App);
app.mount('#app');

// 监听来自background.js的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 如果消息是要求聚焦搜索框
  if (message.action === 'focus_search') {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.focus();
      // 如果有quickSearchText，设置它为搜索值
      if (message.text) {
        searchInput.value = message.text;
        // 触发input事件以激活搜索
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }
  
  // 如果是从右键菜单启动的搜索
  if (message.action === 'search_from_context') {
    chrome.storage.local.get(['quickSearchText'], (result) => {
      if (result.quickSearchText) {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.value = result.quickSearchText;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.focus();
          
          // 用完后清除
          chrome.storage.local.remove(['quickSearchText']);
        }
      }
    });
  }
});

// 当弹出窗口完全加载后，检查是否有快速搜索文本
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['quickSearchText'], (result) => {
    if (result.quickSearchText) {
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.value = result.quickSearchText;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.focus();
          
          // 用完后清除
          chrome.storage.local.remove(['quickSearchText']);
        }
      }, 300); // 给Vue一点时间来渲染
    }
  });
  
  // 在弹出窗口打开时发送消息
  chrome.runtime.sendMessage({ action: 'popup_opened' });
});

// 添加键盘快捷键支持
document.addEventListener('keydown', (event) => {
  // Ctrl+F (Command+F on Mac) 聚焦到搜索框
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault();
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }
  
  // Escape 键关闭弹出窗口
  if (event.key === 'Escape') {
    window.close();
  }
}); 