import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

interface PageProps {
  params: Promise<{ name: string }>;
}

async function getPrototype(name: string) {
  try {
    const prototypeDir = path.join(CONTENT_DIR, 'prototypes', name);
    const indexPath = path.join(prototypeDir, 'index.html');
    
    // Check if directory exists
    try {
      await fs.access(prototypeDir);
    } catch {
      return null;
    }

    // Read index.html
    const htmlContent = await fs.readFile(indexPath, 'utf-8');
    
    // Read other files in the directory (CSS, JS, etc.)
    const files = await fs.readdir(prototypeDir);
    const assets: Record<string, string> = {};
    
    for (const file of files) {
      if (file !== 'index.html') {
        const filePath = path.join(prototypeDir, file);
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            const content = await fs.readFile(filePath, 'utf-8');
            assets[file] = content;
          }
        } catch (err) {
          // Skip files that can't be read
          console.warn(`Could not read file ${file}:`, err);
        }
      }
    }

    return { html: htmlContent, assets };
  } catch (error) {
    console.error('Error loading prototype:', error);
    return null;
  }
}

export default async function PrototypePage({ params }: PageProps) {
  const { name } = await params;
  const prototype = await getPrototype(name);

  if (!prototype) {
    notFound();
  }

  // Inject assets into HTML
  let html = prototype.html;
  
  // Build CSS and JS content
  let cssContent = '';
  const jsFiles: Array<{name: string, content: string}> = [];
  
  for (const [filename, content] of Object.entries(prototype.assets)) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'css') {
      cssContent += `\n/* ${filename} */\n${content}\n`;
    } else if (ext === 'js') {
      jsFiles.push({ name: filename, content });
    }
  }
  
  // Sort JS files: data.js first, then others
  jsFiles.sort((a, b) => {
    if (a.name.includes('data')) return -1;
    if (b.name.includes('data')) return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Inject CSS in head
  if (cssContent) {
    // Remove existing style tags and link tags for CSS
    html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
    // Add CSS before closing head tag
    if (html.includes('</head>')) {
      html = html.replace('</head>', `<style>${cssContent}</style></head>`);
    } else {
      // If no </head> tag, add before </html> or at start of body
      html = html.replace('<body>', `<head><style>${cssContent}</style></head><body>`);
    }
  }
  
  // Inject JS before closing body tag
  if (jsFiles.length > 0) {
    // Remove existing script src tags
    html = html.replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/gi, '');
    html = html.replace(/<script[^>]*src=["'][^"']*["'][^>]*\/>/gi, '');
    
    // Add all JS files before closing body tag
    const jsContent = jsFiles.map(js => `<!-- ${js.name} --><script>${js.content}</script>`).join('\n');
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${jsContent}\n</body>`);
    } else {
      // If no </body> tag, add before </html>
      html = html.replace('</html>', `${jsContent}\n</html>`);
    }
  }

  return (
    <div className="h-screen w-screen">
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title={name}
      />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const prototypesDir = path.join(CONTENT_DIR, 'prototypes');
    const dirs = await fs.readdir(prototypesDir, { withFileTypes: true });
    
    return dirs
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
      }));
  } catch {
    return [];
  }
}
