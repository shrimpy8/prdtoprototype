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
  
  // Replace relative asset references with inline content
  for (const [filename, content] of Object.entries(prototype.assets)) {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (ext === 'css') {
      // Replace <link rel="stylesheet" href="filename.css"> with inline style
      html = html.replace(
        new RegExp(`<link[^>]*href=["']${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi'),
        `<style>${content}</style>`
      );
    } else if (ext === 'js') {
      // Replace <script src="filename.js"></script> with inline script
      html = html.replace(
        new RegExp(`<script[^>]*src=["']${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*></script>`, 'gi'),
        `<script>${content}</script>`
      );
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
