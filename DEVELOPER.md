# Quick Bookmarksretrieval - Developer Guide

This document provides technical details about the architecture and implementation of the Quick Bookmarksretrieval extension.

## Architecture Overview

The extension is built using:
- **Vue 3**: For reactive UI components
- **Vite**: For fast development and optimized builds
- **Chrome Extension API**: For accessing bookmarks and browser functionality

### Key Components

1. **Popup Interface** (`src/App.vue`):
   - Main UI component that users interact with
   - Displays and filters bookmarks
   - Handles click events to open bookmarks

2. **Background Script** (`src/background.js`):
   - Runs in the background when the extension is installed or updated
   - Used for potential future enhancements like sync or notifications

3. **Build System** (`build.js`):
   - Custom build script that uses Vite to build the Vue application
   - Copies necessary files to the dist folder
   - Creates placeholder icons if needed

## Chrome APIs Used

- `chrome.bookmarks.getTree()`: Retrieves the entire bookmark tree
- `chrome.tabs.create()`: Opens a new tab when a bookmark is clicked

## Development Workflow

1. Make changes to the source files
2. Run `npm run dev` to start the development server
3. Load the extension in Chrome (in developer mode)
4. Test your changes
5. Run `npm run build:ext` to create a production build

## ES Modules vs CommonJS

This project uses ES modules (ESM) as indicated by `"type": "module"` in package.json. 
When writing scripts or importing/exporting modules:

- Use `import` instead of `require()`
- Use `export` instead of `module.exports`
- For scripts that need `__dirname` or `__filename`, use the pattern in `build.js`:
  ```js
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  ```

## Styling Guidelines

The extension follows Google's Material Design principles with:
- Blue primary color (#4285f4)
- Green secondary color (#34a853)
- Clean, minimal UI
- Easy-to-read typography

## Future Enhancement Ideas

1. Add support for bookmark folders with collapsible sections
2. Implement recently used bookmarks section
3. Add drag-and-drop to reorder bookmarks
4. Sync custom ordering between devices

## Testing

Currently, manual testing is used:
1. Load the extension in Chrome
2. Test basic functionality (search, click, etc.)
3. Check for console errors

Future improvements could include automated testing with Jest or similar frameworks. 