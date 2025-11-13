'use client';

import { useState, useEffect } from 'react';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

interface PrototypesListViewProps {
  onCreatePrototype: () => Promise<void>;
  refreshKey?: number;
}

export default function PrototypesListView({ onCreatePrototype, refreshKey }: PrototypesListViewProps) {
  const [prototypes, setPrototypes] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPrototypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files?dir=prototypes');
      const data = await response.json();
      
      if (data.items) {
        // Filter to only show prototype directories
        const prototypeDirs = data.items.filter((item: FileItem) => 
          item.type === 'directory' && item.path !== 'prototypes'
        );
        // Sort by modified date (newest first)
        const sorted = prototypeDirs.sort((a: FileItem, b: FileItem) => 
          new Date(b.modified).getTime() - new Date(a.modified).getTime()
        );
        setPrototypes(sorted);
      }
    } catch (error) {
      console.error('Error loading prototypes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrototypes();
  }, []);

  useEffect(() => {
    if (refreshKey !== undefined) {
      loadPrototypes();
    }
  }, [refreshKey]);

  const getPrototypeName = (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const handleOpenPrototype = (prototype: FileItem) => {
    const prototypeName = getPrototypeName(prototype.path);
    const url = `/prototypes/${prototypeName}`;
    window.open(url, '_blank');
  };

  const handleDeleteClick = (prototype: FileItem) => {
    setDeleteConfirm(prototype);
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

      setDeleteConfirm(null);
      loadPrototypes();
    } catch (error) {
      console.error('Error deleting:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading prototypes...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Prototypes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {prototypes.length} {prototypes.length === 1 ? 'prototype' : 'prototypes'}
              </p>
            </div>
            <button
              onClick={async () => {
                await onCreatePrototype();
                loadPrototypes();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Prototype
            </button>
          </div>

          {prototypes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No prototypes yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first prototype to get started
              </p>
              <button
                onClick={async () => {
                  await onCreatePrototype();
                  loadPrototypes();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Prototype
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {prototypes.map((prototype) => {
                const prototypeName = getPrototypeName(prototype.path);
                const prototypeUrl = `/prototypes/${prototypeName}`;
                
                return (
                  <div
                    key={prototype.path}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-purple-500 dark:hover:border-purple-600 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-3xl mt-1">🚀</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {prototype.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span>Modified {formatDate(prototype.modified)}</span>
                            <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">
                              {prototypeUrl}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenPrototype(prototype)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open in New Tab
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}${prototypeUrl}`);
                                alert('URL copied to clipboard!');
                              }}
                              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy URL
                            </button>
                            <button
                              onClick={() => handleDeleteClick(prototype)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

