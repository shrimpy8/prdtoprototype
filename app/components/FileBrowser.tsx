'use client';

import { useState, useEffect } from 'react';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

interface FileBrowserProps {
  onFileSelect: (path: string, type: string) => void;
  currentPath?: string;
  refreshKey?: number;
  onRefresh?: () => void;
}

export default function FileBrowser({ onFileSelect, currentPath, refreshKey, onRefresh }: FileBrowserProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentDir, setCurrentDir] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDirectory = async (dir: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dir) params.set('dir', dir);
      
      const response = await fetch(`/api/files?${params.toString()}`);
      const data = await response.json();
      
      if (data.items) {
        // Filter to only show docs-and-prds and prototypes directories
        const filtered = data.items.filter((item: FileItem) => {
          if (dir === '') {
            // At root, only show these two directories
            return item.name === 'docs and prds' || item.name === 'prototypes';
          }
          // Inside directories, show everything
          return true;
        });
        
        // Sort: directories first, then files
        const sorted = [...filtered].sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        setItems(sorted);
        setCurrentDir(dir);
      }
    } catch (error) {
      console.error('Error loading directory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  useEffect(() => {
    if (refreshKey !== undefined) {
      loadDirectory(currentDir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleItemClick = (item: FileItem, e?: React.MouseEvent) => {
    // Don't navigate if clicking the delete button
    if (e && (e.target as HTMLElement).closest('.delete-button')) {
      return;
    }

    if (item.type === 'directory') {
      loadDirectory(item.path);
    } else {
      onFileSelect(item.path, item.type);
    }
  };

  const handleDeleteClick = (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(deleteConfirm.path)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete');
      }

      const deletedPath = deleteConfirm.path;
      
      // Close the dialog first
      setDeleteConfirm(null);
      
      // Clear selection FIRST if the deleted item or its children were selected
      if (currentPath && (currentPath === deletedPath || currentPath.startsWith(deletedPath + '/'))) {
        onFileSelect('', '');
      }

      // If we're inside the deleted directory, navigate back
      if (currentDir === deletedPath || currentDir.startsWith(deletedPath + '/')) {
        const parentDir = deletedPath.split('/').slice(0, -1).join('/');
        setCurrentDir(parentDir);
        loadDirectory(parentDir);
      } else {
        // Just refresh the current directory
        loadDirectory(currentDir);
      }
      
      // Trigger parent refresh
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    if (currentDir) {
      const parentDir = currentDir.split('/').slice(0, -1).join('/');
      loadDirectory(parentDir);
    } else {
      loadDirectory();
    }
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'directory') {
      return '📁';
    }
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (['md', 'markdown'].includes(ext || '')) return '📄';
    if (['html', 'htm'].includes(ext || '')) return '🌐';
    return '📄';
  };

  const isPrototypeDirectory = (item: FileItem) => {
    return item.type === 'directory' && item.path.startsWith('prototypes/') && item.path !== 'prototypes';
  };

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            {currentDir && (
              <button
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                ← Back
              </button>
            )}
            <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              {currentDir || 'Content'}
            </h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No files found
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.path}
                  className={`group relative flex items-center rounded-md ${
                    currentPath === item.path
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : ''
                  }`}
                >
                  <button
                    onClick={(e) => handleItemClick(item, e)}
                    className={`flex-1 text-left px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                      currentPath === item.path
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : ''
                    }`}
                  >
                    <span>{getFileIcon(item)}</span>
                    <span className="text-sm truncate flex-1">{item.name}</span>
                  </button>
                  {isPrototypeDirectory(item) && (
                    <button
                      onClick={(e) => handleDeleteClick(item, e)}
                      className="delete-button opacity-0 group-hover:opacity-100 px-2 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-opacity"
                      title="Delete prototype"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Delete Prototype?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Are you sure you want to delete the prototype <strong>"{deleteConfirm.name}"</strong>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              This will permanently delete the entire prototype directory and all its files. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Prototype'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
