'use client';

interface InstructionsProps {
  onCreateDoc: () => void;
  onCreatePrototype: () => void;
}

export default function Instructions({ onCreateDoc, onCreatePrototype }: InstructionsProps) {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to Your Productivity Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your documents, PRDs, and interactive prototypes in one place
          </p>
        </div>

        {/* How This App Works */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📚 How This App Works
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
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
            <p>
              All your content is stored locally in the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">content/</code> directory, 
              giving you full control and privacy.
            </p>
          </div>
        </section>

        {/* Creating Documents */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📄 Creating Documents
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-medium mb-1">Click the "+ New Doc" button</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Located in the top-right corner of the header
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-medium mb-1">Enter a filename</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The file will be created in the "docs and prds" folder (e.g., "my-spec.md")
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-medium mb-1">Edit and save</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click "Edit" to modify the markdown content, then "Save" when done. 
                  You can also delete documents using the "Delete" button.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onCreateDoc}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Try it: Create a New Document →
              </button>
            </div>
          </div>
        </section>

        {/* Creating Prototypes */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🚀 Creating Prototypes
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-medium mb-1">Click the "+ New Prototype" button</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Located next to the "New Doc" button in the header
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-medium mb-1">Enter a prototype name</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The name will be used to create a folder and URL route (e.g., "my-app" becomes /prototypes/my-app)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-medium mb-1">Edit your prototype</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Navigate to the prototype folder in the sidebar and edit the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">index.html</code> file. 
                  You can add CSS and JavaScript files that will be automatically inlined.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <p className="font-medium mb-1">Share with your team</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Each prototype gets its own shareable URL: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/prototypes/[name]</code>. 
                  Share this URL with team members to show your work!
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onCreatePrototype}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Try it: Create a New Prototype →
              </button>
            </div>
          </div>
        </section>

        {/* Key Actions */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ⌨️ Key Actions
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
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
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🗑️ Deleting</h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Delete markdown files with the Delete button</li>
                <li>Delete prototypes by hovering and clicking trash icon</li>
                <li>Confirmation dialogs prevent accidents</li>
                <li>Deletions cannot be undone</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Quick Tips
          </h2>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>All files are stored locally in the <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">content/</code> directory</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Prototype routes are automatically generated when you create a prototype</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>CSS and JavaScript files in prototypes are automatically inlined when referenced</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Use markdown syntax for rich text formatting in documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>The app supports dark mode based on your system preferences</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

