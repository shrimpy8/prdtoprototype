# Personal Productivity Hub

A Next.js application for managing product requirements documents (PRDs) and creating interactive prototypes. Transform your ideas from documentation to working prototypes in one unified workspace.

## 🎯 Overview

**Personal Productivity Hub** is a productivity tool that helps you:
- 📝 Write and manage PRDs and documentation in Markdown
- 🚀 Build interactive HTML prototypes with CSS and JavaScript
- 🔗 Share prototypes via shareable URLs with your team
- 💾 Store everything locally in your `content/` directory
- 📋 Browse documents and prototypes with dedicated list views
- 🎨 Enjoy a modern, resizable interface with dark mode support

Perfect for product managers, designers, and developers who want a simple, local-first approach to managing PRDs and prototyping.

## ✨ Features

### Document Management
- **Markdown Editor**: Create, edit, and preview markdown files with live preview
- **PRD Support**: Organize product requirements documents alongside your documentation
- **File Browser**: Navigate your content with an intuitive, resizable sidebar file browser
- **Documents List View**: Browse all documents in a beautiful card grid with metadata (size, modified date)
- **CRUD Operations**: Full create, read, update, and delete functionality

### Prototype Creation
- **Quick Prototyping**: Create new prototypes with a single click
- **Shareable URLs**: Each prototype gets its own route (`/prototypes/[name]`) that you can share
- **Prototypes List View**: View all prototypes with quick actions (open in new tab, copy URL, delete)
- **Asset Management**: Automatically inline CSS and JavaScript files referenced in your HTML
- **Sandboxed Execution**: Prototypes run in secure iframes for safety

### User Interface
- **Resizable Sidebar**: Drag to resize the file browser sidebar (250px - 600px)
- **Folder Navigation**: Click folders to see dedicated list views for documents and prototypes
- **Dark Mode**: Automatically follows your system preferences
- **Modern UI**: Built with Tailwind CSS for a clean, responsive interface
- **Collapsible Instructions**: Interactive welcome screen with expandable sections

### Developer Experience
- **TypeScript**: Fully typed for better development experience
- **Component Architecture**: Well-organized React components for maintainability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository** (or download the project):
   ```bash
   git clone <repository-url>
   cd prdtoprototype
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

That's it! You're ready to start creating documents and prototypes.

## 📁 Project Structure

```
prdtoprototype/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for file operations
│   ├── components/        # React components
│   │   ├── FileBrowser.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── PrototypeViewer.tsx
│   │   ├── Instructions.tsx
│   │   ├── DocumentsListView.tsx
│   │   └── PrototypesListView.tsx
│   ├── prototypes/        # Dynamic prototype routes
│   │   └── [name]/
│   └── page.tsx           # Main home page
├── content/               # Your content directory (created automatically)
│   ├── docs and prds/    # Markdown documents and PRDs
│   │   ├── welcome.md
│   │   └── *.md
│   └── prototypes/       # Prototype directories
│       └── [prototype-name]/
│           ├── index.html
│           ├── styles.css (optional)
│           └── app.js (optional)
└── public/               # Static assets
```

## 📖 Usage Guide

### Navigation

- **Sidebar**: Use the left sidebar to browse files and folders
- **Resize Sidebar**: Drag the divider between the sidebar and main content to resize (250px - 600px)
- **Folder Views**: Click on "docs and prds" or "prototypes" folders to see dedicated list views
- **Back Navigation**: Use the "← Back" button in the sidebar to navigate up directories

### Creating Documents

1. Click the **"+ New Doc"** button in the header
2. Enter a filename (e.g., `my-prd.md`)
3. The file will be created in `content/docs and prds/`
4. Click the file in the sidebar or documents list view to open it
5. Click **"Edit"** to modify the content
6. Click **"Save"** when done
7. Use **"Delete"** to remove files (with confirmation)

### Documents List View

When you click on the "docs and prds" folder, you'll see:
- All markdown documents displayed in a card grid
- File size and last modified date for each document
- Quick access to create new documents
- Click any document card to open and edit it

### Creating Prototypes

1. Click the **"+ New Prototype"** button in the header
2. Enter a prototype name (e.g., `my-app`)
3. The name will be sanitized for URL use
4. A new directory is created with a starter `index.html`

### Prototypes List View

When you click on the "prototypes" folder, you'll see:
- All prototypes displayed in a card grid
- Last modified date for each prototype
- **Open in New Tab**: Click to view the prototype in a new browser tab
- **Copy URL**: Copy the shareable prototype URL to your clipboard
- **Delete**: Remove a prototype with confirmation dialog

### Accessing Prototypes

Each prototype is automatically accessible at:
```
http://localhost:3000/prototypes/[name]
```

**Example:** If you create a prototype named "my-app", access it at:
```
http://localhost:3000/prototypes/my-app
```

You can share this URL with team members - they'll see your prototype running live!

### Adding Assets to Prototypes

Prototypes support CSS and JavaScript files that are automatically inlined:

1. Edit the `index.html` file in your prototype directory
2. Reference CSS files: `<link rel="stylesheet" href="styles.css">`
3. Reference JS files: `<script src="app.js"></script>`
4. The app will automatically inline these files when serving the prototype

**Example prototype structure:**
```
prototypes/my-app/
├── index.html
├── styles.css
└── app.js
```

## 🔌 API Reference

The app provides a REST API for file operations:

### Read a File
```http
GET /api/files?path=docs and prds/my-doc.md
```

### List Directory Contents
```http
GET /api/files?dir=prototypes
```

### Create a File or Directory
```http
POST /api/files
Content-Type: application/json

{
  "path": "docs and prds/new-doc.md",
  "content": "# My Document\n\nContent here...",
  "isDirectory": false
}
```

### Update a File
```http
PUT /api/files
Content-Type: application/json

{
  "path": "docs and prds/my-doc.md",
  "content": "# Updated Content"
}
```

### Delete a File or Directory
```http
DELETE /api/files?path=docs and prds/my-doc.md
```

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## 🧰 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) with [remark-gfm](https://github.com/remarkjs/remark-gfm)
- **File Processing**: [gray-matter](https://github.com/jonschlinkert/gray-matter)
- **Runtime**: Node.js File System API

## 📝 Notes

- **Local Storage**: All content is stored locally in the `content/` directory - no cloud, no database, just files
- **File System**: The app reads and writes directly to the filesystem
- **Security**: Prototypes run in sandboxed iframes to prevent security issues
- **Dark Mode**: Automatically enabled based on your system preferences
- **Shareable URLs**: Prototype routes work both locally and when deployed
- **Resizable Interface**: Sidebar width is adjustable for optimal viewing experience
- **List Views**: Dedicated views for documents and prototypes make it easy to browse and manage your content

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is private and proprietary.

---

**Happy prototyping!** 🚀
