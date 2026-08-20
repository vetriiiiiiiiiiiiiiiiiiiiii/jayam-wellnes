const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace next/link with react-router-dom Link
      if (content.includes('next/link')) {
        content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"];?/g, "import { Link } from 'react-router-dom';");
      }
      
      // Replace next/image with standard img
      if (content.includes('next/image')) {
        content = content.replace(/import\s+Image\s+from\s+['"]next\/image['"];?/g, "");
        content = content.replace(/<Image/g, "<img");
        content = content.replace(/<\/Image>/g, "");
      }
      
      // Replace next/navigation hooks
      if (content.includes('next/navigation')) {
        content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]next\/navigation['"];?/g, (match, p1) => {
          let newImports = [];
          if (p1.includes('useRouter')) newImports.push('useNavigate');
          if (p1.includes('usePathname')) newImports.push('useLocation');
          return newImports.length ? `import { ${newImports.join(', ')} } from 'react-router-dom';` : '';
        });
        content = content.replace(/useRouter\(\)/g, "useNavigate()");
        content = content.replace(/usePathname\(\)/g, "useLocation()");
      }

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDir(path.join(__dirname, 'src/components'));
console.log('Done transforming Next.js components to React.');
