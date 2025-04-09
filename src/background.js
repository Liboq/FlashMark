/**
 * Chrome Extension Background Script
 * 处理插件的后台任务、图标点击事件和快捷键
 */

// 处理插件图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 打开插件弹窗
  chrome.action.openPopup();
});

// 处理快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_popup') {
    // 打开插件弹窗
    chrome.action.openPopup();
  } else if (command === 'quick_search') {
    // 打开弹窗并聚焦到搜索框
    chrome.action.openPopup().then(() => {
      chrome.runtime.sendMessage({ action: 'focus_search' });
    });
  }
});

// 安装/更新事件处理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装时的操作
    showWelcomeMessage();
  } else if (details.reason === 'update') {
    // 更新时的操作
    const thisVersion = chrome.runtime.getManifest().version;
    console.log(`已更新到版本: ${thisVersion}`);
  }
});

/**
 * 显示欢迎消息通知
 */
function showWelcomeMessage() {
  try {
    chrome.notifications.create('welcome', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.jpeg'),
      title: '书签检索已安装',
      message: '使用Ctrl+Shift+B快速打开插件，轻松搜索您的书签！',
      priority: 2
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('通知创建失败:', chrome.runtime.lastError);
        // 如果通知失败，尝试使用本地存储标记欢迎信息
        saveWelcomeFlag();
      }
    });
  } catch (err) {
    console.error('显示欢迎消息失败:', err);
    // 在通知功能不可用时，使用备选方法
    saveWelcomeFlag();
  }
}

/**
 * 保存欢迎标记，用于在popup中显示欢迎消息
 */
function saveWelcomeFlag() {
  chrome.storage.local.set({ 
    'showWelcome': true,
    'installTime': Date.now()
  });
}

// 监听来自弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get_bookmarks') {
    // 在后台中处理书签数据请求
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      sendResponse({ success: true, bookmarks: bookmarkTreeNodes });
    });
    return true; // 异步响应
  }
});

// 右键菜单集成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'search_bookmarks',
    title: '在书签中搜索 "%s"',
    contexts: ['selection']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'search_bookmarks' && info.selectionText) {
    // 打开弹窗并使用选中的文本进行搜索
    chrome.storage.local.set({ 'quickSearchText': info.selectionText }, () => {
      chrome.action.openPopup();
    });
  }
});

// 初始化徽章文本
updateBookmarkCount();

/**
 * 更新图标上的徽章，显示书签总数
 */
function updateBookmarkCount() {
  chrome.bookmarks.getTree((bookmarkTree) => {
    let count = 0;
    
    function countBookmarks(nodes) {
      for (const node of nodes) {
        if (node.url) count++;
        if (node.children) countBookmarks(node.children);
      }
    }
    
    countBookmarks(bookmarkTree);
    
    // 超过1000显示999+
    const badgeText = count > 999 ? '999+' : count.toString();
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#6A11CB' });
  });
}

// 每天更新一次书签计数
setInterval(updateBookmarkCount, 24 * 60 * 60 * 1000);

// 监听书签变化，更新计数
chrome.bookmarks.onCreated.addListener(updateBookmarkCount);
chrome.bookmarks.onRemoved.addListener(updateBookmarkCount);
chrome.bookmarks.onChanged.addListener(updateBookmarkCount);
chrome.bookmarks.onMoved.addListener(updateBookmarkCount); 