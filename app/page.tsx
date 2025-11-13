'use client';

import { useState, useRef, useEffect } from 'react';
import FileBrowser from './components/FileBrowser';
import MarkdownEditor from './components/MarkdownEditor';
import PrototypeViewer from './components/PrototypeViewer';
import Instructions from './components/Instructions';
import DocumentsListView from './components/DocumentsListView';
import PrototypesListView from './components/PrototypesListView';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const handleFolderSelect = (path: string) => {
    setSelectedFolder(path);
    setSelectedFile(null);
    setFileContent('');
    setFileType('');
  };

  const handleFileSelect = async (path: string, type: string) => {
    if (!path) {
      setSelectedFile(null);
      setSelectedFolder(null);
      setFileContent('');
      setFileType('');
      return;
    }

    setSelectedFile(path);
    setSelectedFolder(null);
    setFileType(type);
    setLoading(true);

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      if (!response.ok || data.error) {
        // File doesn't exist or was deleted
        if (response.status === 404 || data.error) {
          setSelectedFile(null);
          setFileContent('');
          setFileType('');
          return;
        }
        console.error('Error loading file:', data.error);
        setFileContent('');
      } else {
        setFileContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      // If fetch fails, clear selection
      setSelectedFile(null);
      setFileContent('');
      setFileType('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string) => {
    if (!selectedFile) return;
    
    const response = await fetch('/api/files', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selectedFile, content }),
    });

    if (!response.ok) {
      throw new Error('Failed to save');
    }

    setFileContent(content);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async () => {
    if (!selectedFile) return;

    const response = await fetch(`/api/files?path=${encodeURIComponent(selectedFile)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete');
    }

    setSelectedFile(null);
    setFileContent('');
    setRefreshKey((k) => k + 1);
  };

  const handleCreateFile = async () => {
    const fileName = prompt('Enter file name (e.g., my-document.md):');
    if (!fileName) return;

    // Ensure it ends with .md
    const finalName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    const filePath = `docs and prds/${finalName}`;

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: `# ${finalName.replace('.md', '')}\n\n` }),
      });

      if (!response.ok) {
        throw new Error('Failed to create file');
      }

      setRefreshKey((k) => k + 1);
      handleFileSelect(filePath, 'file');
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file');
    }
  };

  const handleCreatePrototype = async (): Promise<void> => {
    const prototypeName = prompt('Enter prototype name (will be used as folder name):');
    if (!prototypeName) return;

    // Sanitize name (remove spaces, special chars)
    const sanitizedName = prototypeName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const prototypePath = `prototypes/${sanitizedName}`;

    try {
      // Create directory
      const dirResponse = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: prototypePath, isDirectory: true }),
      });

      if (!dirResponse.ok) {
        throw new Error('Failed to create prototype directory');
      }

      // Create index.html
      const htmlPath = `${prototypePath}/index.html`;
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prototypeName}</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <h1>${prototypeName}</h1>
    <p>Start building your prototype here!</p>
    <script>
        console.log('Prototype: ${prototypeName}');
    </script>
</body>
</html>`;

      const fileResponse = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: htmlPath, content: htmlContent }),
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to create index.html');
      }

      setRefreshKey((k) => k + 1);
      const url = `${window.location.origin}/prototypes/${sanitizedName}`;
      alert(`Prototype created! Access it at: ${url}\n\nYou can share this URL with your team members.`);
    } catch (error) {
      console.error('Error creating prototype:', error);
      alert('Failed to create prototype');
    }
  };

  const isMarkdown = (path: string) => {
    return path.endsWith('.md') || path.endsWith('.markdown');
  };

  const isPrototype = (path: string) => {
    return path.endsWith('.html') && path.includes('prototypes');
  };

  // Resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 250 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="flex-shrink-0 bg-white dark:bg-gray-900"
        style={{ width: `${sidebarWidth}px` }}
      >
        <FileBrowser 
          key={refreshKey}
          onFileSelect={handleFileSelect}
          onFolderSelect={handleFolderSelect}
          currentPath={selectedFile || undefined}
          currentFolder={selectedFolder || undefined}
          refreshKey={refreshKey}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      {/* Resizer */}
      <div
        ref={resizeRef}
        onMouseDown={() => setIsResizing(true)}
        className="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-col-resize transition-colors flex-shrink-0"
        style={{ cursor: 'col-resize' }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Personal Productivity Hub
            </h1>
            {selectedFile && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFile}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateFile}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              + New Doc
            </button>
            <button
              onClick={handleCreatePrototype}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              + New Prototype
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {selectedFolder === 'docs and prds' ? (
            <DocumentsListView
              onFileSelect={handleFileSelect}
              onCreateDoc={handleCreateFile}
              refreshKey={refreshKey}
            />
          ) : selectedFolder === 'prototypes' ? (
            <PrototypesListView
              onCreatePrototype={handleCreatePrototype}
              refreshKey={refreshKey}
            />
          ) : !selectedFile ? (
            <Instructions 
              onCreateDoc={handleCreateFile}
              onCreatePrototype={handleCreatePrototype}
            />
          ) : loading ? (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : isPrototype(selectedFile) ? (
            <PrototypeViewer prototypePath={selectedFile} />
          ) : isMarkdown(selectedFile) ? (
            <MarkdownEditor
              filePath={selectedFile}
              initialContent={fileContent}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ) : (
            <div className="h-full overflow-y-auto bg-white dark:bg-gray-950 p-6">
              <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {fileContent}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
