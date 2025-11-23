const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../node_modules/pdfjs-dist/build');
const targetDir = path.join(__dirname, '../public/pdfjs');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy worker files
const filesToCopy = ['pdf.worker.min.js', 'pdf.worker.min.js.map'];

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✓ Copied ${file} to public/pdfjs/`);
  } else {
    console.warn(`⚠ Warning: ${file} not found in pdfjs-dist/build/`);
  }
});

console.log('PDF.js worker files setup complete!');
