# 书签速查 (QuickMark)

一个Chrome浏览器扩展程序，用于快速访问和搜索您的所有书签。

## 功能特性

- 即时搜索和过滤您的所有书签
- 简洁优雅的Google风格UI界面
- 一键访问您喜爱的网站
- 显示网站favicon图标，便于视觉识别
- 支持键盘快捷键快速操作
- 右键菜单集成，可直接搜索选中文本
- 支持标题或URL搜索模式切换
- 显示书签总数的徽章计数
- 首次安装时的欢迎通知
- 支持分享或复制书签链接
- 支持多种显示状态：加载中、错误、空状态

## 安装方法

### 开发人员安装

1. 克隆此仓库:
   ```
   git clone [repository-url]
   cd quick-bookmarksretrieval
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 创建图标文件:
   - 替换 `public/icons/` 目录下的占位图标
   - 需要的尺寸: 16x16, 48x48, 和 128x128 像素
   - 您可以参考 `icon_template.html` 文件进行设计

4. 构建扩展:
   ```
   npm run build:ext
   ```

5. 在Chrome中加载扩展:
   - 打开Chrome浏览器并访问 `chrome://extensions/`
   - 启用右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"并选择此项目的 `dist` 文件夹

### 用户安装

1. 从Chrome网上应用店下载扩展 (即将推出)
2. 点击"添加到Chrome"进行安装

## 使用指南

1. 点击Chrome工具栏中的扩展图标或按 `Ctrl+B` (Mac上是 `Command+B`)
2. 在搜索框中输入文本以过滤您的书签
3. 点击任意书签在新标签页中打开
4. 使用书签旁的分享按钮复制或分享链接
5. 右键点击网页上的文本，选择"在书签中搜索"选项

### 键盘快捷键

- `Ctrl+B` (Mac上是 `Command+B`): 打开扩展弹窗
- `Ctrl+Shift+B` (Mac上是 `Command+Shift+B`): 打开弹窗并聚焦到搜索框
- `Ctrl+F` (Mac上是 `Command+F`): 弹窗已打开时聚焦到搜索框
- `ESC`: 清空搜索框或关闭弹窗
- `Enter`: 打开第一个匹配的书签
- `Ctrl+数字键(1-9)`: 打开对应位置的书签

您可以通过访问 `chrome://extensions/shortcuts` 自定义这些快捷键。

### 搜索模式

- 点击搜索框右侧的过滤图标可以切换搜索模式:
  - 标题搜索: 在书签标题中搜索关键词
  - URL搜索: 在书签URL中搜索关键词

## 开发指南

- `npm run dev` - 启动开发服务器，支持热重载
- `npm run build` - 构建生产环境版本
- `npm run build:ext` - 构建扩展并将所有必要文件复制到dist文件夹
- `npm run preview` - 在本地预览生产构建

## 文件结构

- `src/` - 源代码
  - `App.vue` - 主Vue组件
  - `popup.js` - 弹窗入口点
  - `background.js` - 扩展的后台脚本
  - `assets/` - CSS和其他资源文件
- `public/` - 静态资源
  - `icons/` - 扩展图标
- `dist/` - 构建输出 (生成)

## 疑难解答

如果遇到错误 "ReferenceError: require is not defined in ES module scope"，请确保在JavaScript文件中使用ES模块语法，因为项目在package.json中配置了 "type": "module"。

## 技术栈

- Vue 3 (使用组合式API)
- Chrome Extension API
- ES Modules
- CSS3动画和过渡

## 版本历史

- v1.1.0 - 新增分享功能、右键菜单集成、徽章计数和键盘快捷键增强
- v1.0.0 - 初始版本

## 贡献

欢迎贡献代码、报告问题或提出新功能建议。详情请参阅 CONTRIBUTING.md。

## 开发者文档

有关技术细节和实现说明，请参阅 DEVELOPER.md。

## 致谢

开发者: Liboq | 微信: Liboq666

## 许可证

MIT 