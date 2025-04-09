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
  
  // Create placeholder icons
  console.log('Creating placeholder icons...');
  
  // Function to create a simple icon with canvas
  const createIconPlaceholder = (size) => {
    // This would typically create actual jpeg files
    // For this example, we're just creating text files with descriptions
    fs.writeFileSync(
      path.join(iconsDir, `icon${size}.jpeg`),
      `Placeholder for ${size}x${size} icon. Replace with actual icon.`
    );
  };
  
  // Create placeholder icons in three sizes
  createIconPlaceholder(16);
  createIconPlaceholder(48);
  createIconPlaceholder(128);
  
  console.log('Build completed successfully! Extension is ready in the dist folder.');
}); 