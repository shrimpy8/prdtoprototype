'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { getPrototypeName } from '../lib/utils';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

interface FileBrowserProps {
  onFileSelect: (path: string, type: string) => void;
  onFolderSelect?: (path: string) => void;
  currentPath?: string;
  currentFolder?: string;
  refreshKey?: number;
  onRefresh?: () => void;
}

export default function FileBrowser({ onFileSelect, onFolderSelect, currentPath, currentFolder, refreshKey, onRefresh }: FileBrowserProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentDir, setCurrentDir] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentDirRef = useRef(currentDir);
  currentDirRef.current = currentDir;

  const loadDirectory = useCallback(async (dir: string = '') => {
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
            return item.name === 'docs and prds' || item.name === 'prototypes';
          }
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
  }, []);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  useEffect(() => {
    if (refreshKey !== undefined) {
      loadDirectory(currentDirRef.current);
    }
  }, [refreshKey, loadDirectory]);

  const handleItemClick = (item: FileItem, e?: React.MouseEvent) => {
    if (e && (e.target as HTMLElement).closest('.delete-button, .open-prototype-button')) {
      return;
    }

    if (item.type === 'directory') {
      if (item.path === 'docs and prds' || item.path === 'prototypes') {
        if (onFolderSelect) {
          onFolderSelect(item.path);
        }
        loadDirectory(item.path);
      } else {
        loadDirectory(item.path);
      }
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
      setDeleteConfirm(null);

      if (currentPath && (currentPath === deletedPath || currentPath.startsWith(deletedPath + '/'))) {
        onFileSelect('', '');
      }

      if (currentDir === deletedPath || currentDir.startsWith(deletedPath + '/')) {
        const parentDir = deletedPath.split('/').slice(0, -1).join('/');
        setCurrentDir(parentDir);
        loadDirectory(parentDir);
      } else {
        loadDirectory(currentDir);
      }

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

  const handleOpenPrototype = (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const prototypeName = getPrototypeName(item.path);
    const url = `/prototypes/${prototypeName}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r-2 border-gray-300 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            {currentDir && (
              <button
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
              >
                ← Back
              </button>
            )}
            <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">
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
                    currentPath === item.path || currentFolder === item.path
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : ''
                  }`}
                >
                  <button
                    onClick={(e) => handleItemClick(item, e)}
                    className={`flex-1 text-left px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 font-medium ${
                      currentPath === item.path || currentFolder === item.path
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{getFileIcon(item)}</span>
                    <span className="text-sm truncate flex-1">{item.name}</span>
                  </button>
                  {isPrototypeDirectory(item) && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenPrototype(item, e)}
                        className="open-prototype-button px-2 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        title={`Open ${item.name} in new tab`}
                        aria-label={`Open ${item.name} in new tab`}
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(item, e)}
                        className="delete-button px-2 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Delete prototype"
                        aria-label={`Delete ${item.name}`}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <DeleteConfirmDialog
          itemName={deleteConfirm.name}
          itemType="Prototype"
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
