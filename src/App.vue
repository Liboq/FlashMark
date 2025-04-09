<template>
  <div class="container">
    <div class="header-section">
      <div class="header">
        <h1>FlashMark</h1>
        <p v-if="!loading && !error">
          找到 {{ filteredBookmarks.length }} 个书签，共 {{ bookmarks.length }} 个
        </p>
        <p v-else>使用此插件快速搜索您的书签</p>
      </div>
      
      <div class="search-box" @click="createRipple">
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input 
          v-model="searchText" 
          class="search-input" 
          type="text" 
          placeholder="搜索书签..." 
          ref="searchInput"
          @input="debounceSearch"
          @keydown.enter="openFirstResult"
        />
        <div class="filter-icon" @click.stop="toggleSearchMode">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
      </div>
    </div>

    <div class="content-section">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载书签...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button class="retry-button" @click="retryLoading">重试</button>
      </div>

      <!-- 书签列表 -->
      <div v-else-if="filteredBookmarks.length > 0" class="bookmarks-list">
        <a 
          v-for="bookmark in displayedBookmarks" 
          :key="bookmark.id" 
          :href="bookmark.url" 
          class="bookmark-item"
          target="_blank"
        >
          <img 
            v-if="bookmark.url" 
            :src="getFaviconUrl(bookmark.url)" 
            class="bookmark-icon" 
            @error="handleIconError($event, bookmark)"
            loading="lazy"
            :alt="bookmark.title.charAt(0)"
          />
          <div v-else class="default-icon">
            {{ bookmark.title.charAt(0).toUpperCase() }}
          </div>
          <span class="bookmark-title">{{ bookmark.title }}</span>
          <!-- 分享按钮 -->
          <button class="share-button" @click="shareBookmark(bookmark, $event)" title="复制/分享">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </a>
        
        <div v-if="filteredBookmarks.length > maxBookmarksToShow" class="more-results">
          还有 {{ filteredBookmarks.length - maxBookmarksToShow }} 个结果
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3>未找到书签</h3>
        <p v-if="searchText.length > 0">没有匹配"{{ searchText }}"的书签</p>
        <p v-else>您尚未添加书签或加载失败</p>
        <button v-if="!searchText.length" class="retry-button" @click="retryLoading">重新加载</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';

// 状态变量
const searchText = ref('');
const bookmarks = ref([]);
const loading = ref(true);
const error = ref(null);
const searchMode = ref('title'); // 'title' | 'url'
const maxBookmarksToShow = ref(50);

// 计算属性
const filteredBookmarks = computed(() => {
  if (!searchText.value) return bookmarks.value;
  
  const searchLower = searchText.value.toLowerCase();
  return bookmarks.value.filter(bookmark => {
    if (searchMode.value === 'title') {
      return bookmark.title.toLowerCase().includes(searchLower);
    } else {
      return bookmark.url?.toLowerCase().includes(searchLower);
    }
  });
});

const displayedBookmarks = computed(() => {
  return filteredBookmarks.value.slice(0, maxBookmarksToShow.value);
});

// 加载书签
async function loadBookmarks() {
  try {
    loading.value = true;
    error.value = null;
    
    const chromeBookmarks = await getAllBookmarks();
    bookmarks.value = chromeBookmarks;
    console.log(`加载了 ${bookmarks.value.length} 个书签`);
  } catch (err) {
    console.error('加载书签失败:', err);
    error.value = '无法加载书签，请确保已授予正确权限';
  } finally {
    loading.value = false;
  }
}

// 递归获取所有书签
async function getAllBookmarks() {
  return new Promise((resolve, reject) => {
    try {
      chrome.bookmarks.getTree(async (results) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        
        const allBookmarks = [];
        const processNode = (node) => {
          if (node.url) {
            allBookmarks.push({
              id: node.id,
              title: node.title || '未命名书签',
              url: node.url,
              dateAdded: node.dateAdded
            });
          }
          
          if (node.children) {
            for (const child of node.children) {
              processNode(child);
            }
          }
        };
        
        for (const root of results) {
          processNode(root);
        }
        
        resolve(allBookmarks);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// 获取网站图标
function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch (e) {
    return '';
  }
}

// 处理图标加载错误
function handleIconError(event, bookmark) {
  event.target.style.display = 'none';
  // 创建默认图标替代
  const defaultIcon = document.createElement('div');
  defaultIcon.className = 'default-icon';
  defaultIcon.textContent = bookmark.title.charAt(0).toUpperCase();
  event.target.parentNode.insertBefore(defaultIcon, event.target.nextSibling);
}

// 重试加载
function retryLoading() {
  loadBookmarks();
}

// 防抖搜索
let searchTimeout;
function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // 搜索逻辑已经通过计算属性实现
  }, 300);
}

// 点击搜索框产生涟漪效果
function createRipple(event) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  
  const searchBox = event.currentTarget;
  searchBox.appendChild(ripple);
  
  const rect = searchBox.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// 切换搜索模式
function toggleSearchMode() {
  searchMode.value = searchMode.value === 'title' ? 'url' : 'title';
}

// 按回车键打开第一个结果
function openFirstResult() {
  if (filteredBookmarks.value.length > 0) {
    window.open(filteredBookmarks.value[0].url, '_blank');
  }
}

// 在组件挂载时加载书签
onMounted(() => {
  loadBookmarks();
  
  // 自动聚焦到搜索框
  setTimeout(() => {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }, 300);

  // 检查是否有来自localStorage的搜索文本
  chrome.storage.local.get(['quickSearchText', 'showWelcome', 'installTime'], (result) => {
    // 处理搜索文本
    if (result.quickSearchText) {
      searchText.value = result.quickSearchText;
      // 用完后清除
      chrome.storage.local.remove(['quickSearchText']);
    }
    
    // 处理欢迎消息
    if (result.showWelcome) {
      // 显示欢迎消息
      showWelcomeToast();
      // 用完后清除
      chrome.storage.local.remove(['showWelcome']);
    }
  });

  // 监听消息
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'focus_search') {
      // 聚焦到搜索框
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  });

  // 监听键盘快捷键
  window.addEventListener('keydown', handleKeyDown);
});

// 在组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  clearTimeout(searchTimeout);
});

// 处理键盘事件
function handleKeyDown(event) {
  // ESC键清空搜索
  if (event.key === 'Escape' && searchText.value) {
    event.preventDefault();
    searchText.value = '';
    document.querySelector('.search-input')?.focus();
  }
  
  // 回车键加载第一个结果
  if (event.key === 'Enter' && filteredBookmarks.value.length > 0) {
    openFirstResult();
  }
  
  // Ctrl+数字键（1-9）快速打开对应位置的书签
  if ((event.ctrlKey || event.metaKey) && !isNaN(parseInt(event.key)) && parseInt(event.key) >= 1 && parseInt(event.key) <= 9) {
    const index = parseInt(event.key) - 1;
    if (filteredBookmarks.value[index]) {
      event.preventDefault();
      window.open(filteredBookmarks.value[index].url, '_blank');
    }
  }
}

// 分享书签
function shareBookmark(bookmark, event) {
  event.preventDefault();
  event.stopPropagation();
  
  if (navigator.share) {
    navigator.share({
      title: bookmark.title,
      url: bookmark.url
    }).catch((error) => console.log('分享失败:', error));
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(bookmark.url)
      .then(() => {
        showCopiedToast(bookmark.title);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }
}

// 显示复制成功提示
function showCopiedToast(title) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `已复制"${title}"的链接`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

// 显示欢迎消息提示
function showWelcomeToast() {
  const toast = document.createElement('div');
  toast.className = 'toast welcome-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">🎉</div>
      <div class="toast-message">
        <strong>欢迎使用书签速查！</strong>
        <p>使用Ctrl+Shift+B快速打开插件</p>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000);
}
</script>

<style>
/* 加载动画 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(106, 17, 203, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 24px;
}

.error-state svg {
  color: #e74c3c;
  margin-bottom: 16px;
}

.error-state h3 {
  margin-bottom: 8px;
  color: #e74c3c;
}

.error-state p {
  color: var(--text-secondary-color);
  margin-bottom: 16px;
}

.retry-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(106, 17, 203, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(106, 17, 203, 0.4);
}

/* 更多结果提示 */
.more-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 12px;
  color: var(--text-secondary-color);
  background-color: rgba(106, 17, 203, 0.05);
  border-radius: 8px;
  margin-top: 8px;
}

/* 分享按钮 */
.share-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: var(--primary-color);
  z-index: 5;
}

.bookmark-item:hover .share-button {
  opacity: 1;
  transform: scale(1);
}

.share-button:hover {
  background-color: var(--primary-color);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(106, 17, 203, 0.3);
}

/* Toast通知样式 */
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(30px);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
  opacity: 0;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* 欢迎Toast样式 */
.welcome-toast {
  width: 300px;
  padding: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  overflow: hidden;
  border-radius: 10px;
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 15px;
}

.toast-icon {
  font-size: 24px;
  margin-right: 12px;
}

.toast-message {
  flex: 1;
}

.toast-message strong {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
}

.toast-message p {
  margin: 0;
  opacity: 0.9;
  font-size: 13px;
}
</style> 