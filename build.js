import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run Vite build
console.log('Building extension with Vite...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error}`);
    return;
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(`Build stderr: ${stderr}`);
  }
  
  // Copy manifest.json to dist
  console.log('Copying manifest.json to dist folder...');
  fs.copyFileSync(
    path.join(__dirname, 'manifest.json'),
    path.join(__dirname, 'dist', 'manifest.json')
  );
  
  // Create src directory in dist if it doesn't exist
  const srcDir = path.join(__dirname, 'dist', 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  // Copy background script to dist/src
  console.log('Copying background script to dist folder...');
  fs.copyFileSync(
    path.join(__dirname, 'src', 'background.js'),
    path.join(srcDir, 'background.js')
  );
  
  // Create icons directory in dist if it doesn't exist
  const iconsDir = path.join(__dirname, 'dist', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // 复制图标文件，不再创建占位图标
  console.log('Copying icon files to dist folder...');
  
  // 从public/icons复制实际图标文件
  const publicIconsDir = path.join(__dirname, 'public', 'icons');
  try {
    if (fs.existsSync(publicIconsDir)) {
      const iconFiles = fs.readdirSync(publicIconsDir);
      
      iconFiles.forEach(file => {
        // 只复制真实图片文件(.png和.jpeg)，跳过txt文件
        if (file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg')) {
          fs.copyFileSync(
            path.join(publicIconsDir, file),
            path.join(iconsDir, file)
          );
          console.log(`Copied icon: ${file}`);
        }
      });
    } else {
      console.warn('Warning: public/icons directory not found. Icons will be missing.');
      // 如果找不到公共图标目录，则创建基本图标占位符
      createBasicIconPlaceholders();
    }
  } catch (err) {
    console.error('Error copying icons:', err);
    // 出错时创建基本图标占位符
    createBasicIconPlaceholders();
  }
  
  // 创建基本图标占位符的函数
  function createBasicIconPlaceholders() {
    console.log('Creating basic icon placeholders...');
    
    const sizes = [16, 48, 128];
    sizes.forEach(size => {
      // 创建一个基本的PNG图标（适当大小的空白文件不会工作）
      // 这里我们只是在提醒时写入占位符，实际使用时应创建真实PNG
      fs.writeFileSync(
        path.join(iconsDir, `icon${size}.png`),
        `This is a placeholder. Please replace with a real ${size}x${size} PNG icon.`
      );
    });
  }
  
  console.log('Build completed successfully! Extension is ready in the dist folder.');
}); 