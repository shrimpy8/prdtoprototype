'use client';

import { useState } from 'react';

interface InstructionsProps {
  onCreateDoc: () => void;
  onCreatePrototype: () => void;
}

export default function Instructions({ onCreateDoc, onCreatePrototype }: InstructionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Productivity Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Create documents, PRDs, and interactive prototypes in one place. Get started in seconds.
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={onCreateDoc}
              className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 text-lg font-semibold min-w-[240px] justify-center"
            >
              <span className="text-2xl">📄</span>
              <span>Create New Document</span>
            </button>
            <button
              onClick={onCreatePrototype}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 text-lg font-semibold min-w-[240px] justify-center"
            >
              <span className="text-2xl">🚀</span>
              <span>Create New Prototype</span>
            </button>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📝</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Documents & PRDs</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Write markdown documents, product requirements, and notes. All stored locally for privacy.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎨</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Interactive Prototypes</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Build HTML prototypes with shareable URLs. Perfect for quick demos and team collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {/* How This App Works - Collapsed by default */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('how-it-works')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>📚</span>
                <span>How This App Works</span>
              </h2>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'how-it-works' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'how-it-works' && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3 text-gray-700 dark:text-gray-300 mt-4">
                  <p>
                    This app helps you organize and manage your work in two main areas:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Documents & PRDs</strong>: Store and edit markdown files for documentation, 
                      product requirements, notes, and specifications
                    </li>
                    <li>
                      <strong>Prototypes</strong>: Create interactive HTML prototypes that can be shared 
                      with team members via shareable URLs
                    </li>
                  </ul>
                  <p className="text-sm">
                    All your content is stored locally in the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">content/</code> directory, 
                    giving you full control and privacy.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Creating Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('creating-docs')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>📄</span>
                <span>Creating Documents</span>
              </h2>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'creating-docs' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'creating-docs' && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3 text-gray-700 dark:text-gray-300 mt-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-green-600">1</span>
                    <div>
                      <p className="font-medium mb-1">Click the "+ New Doc" button</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Located in the top-right corner of the header
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-green-600">2</span>
                    <div>
                      <p className="font-medium mb-1">Enter a filename</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The file will be created in the "docs and prds" folder (e.g., "my-spec.md")
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-green-600">3</span>
                    <div>
                      <p className="font-medium mb-1">Edit and save</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click "Edit" to modify the markdown content, then "Save" when done. 
                        You can also delete documents using the "Delete" button.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Creating Prototypes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('creating-prototypes')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>🚀</span>
                <span>Creating Prototypes</span>
              </h2>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'creating-prototypes' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'creating-prototypes' && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3 text-gray-700 dark:text-gray-300 mt-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-purple-600">1</span>
                    <div>
                      <p className="font-medium mb-1">Click the "+ New Prototype" button</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Located next to the "New Doc" button in the header
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-purple-600">2</span>
                    <div>
                      <p className="font-medium mb-1">Enter a prototype name</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The name will be used to create a folder and URL route (e.g., "my-app" becomes /prototypes/my-app)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-purple-600">3</span>
                    <div>
                      <p className="font-medium mb-1">Edit your prototype</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Navigate to the prototype folder in the sidebar and edit the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">index.html</code> file. 
                        You can add CSS and JavaScript files that will be automatically inlined.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-purple-600">4</span>
                    <div>
                      <p className="font-medium mb-1">Share with your team</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Each prototype gets its own shareable URL: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/prototypes/[name]</code>. 
                        Share this URL with team members to show your work!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('key-actions')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>⌨️</span>
                <span>Key Actions & Tips</span>
              </h2>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                  expandedSection === 'key-actions' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'key-actions' && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 mt-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">📝 Documents</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Click any markdown file to view it</li>
                      <li>Use "Edit" to modify content</li>
                      <li>Click "Save" to persist changes</li>
                      <li>Use "Delete" to remove files</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🗂️ Navigation</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Browse files in the left sidebar</li>
                      <li>Click folders to navigate</li>
                      <li>Use "← Back" to go up directories</li>
                      <li>Hover over prototypes to see delete option</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🎨 Prototypes</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Each prototype is a folder with HTML files</li>
                      <li>Edit index.html to build your prototype</li>
                      <li>Add CSS/JS files and reference them in HTML</li>
                      <li>Access via /prototypes/[name] route</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">💡 Quick Tips</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>All files stored locally in <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">content/</code></li>
                      <li>Prototype routes auto-generated</li>
                      <li>CSS/JS files auto-inlined</li>
                      <li>Dark mode supported</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

