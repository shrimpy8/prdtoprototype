# PRD to Prototype

A Next.js application for managing product requirements documents (PRDs) and creating interactive prototypes. Transform your ideas from documentation to working prototypes in one unified workspace.

## 🎯 Overview

**PRD to Prototype** is a productivity tool that helps you:
- 📝 Write and manage PRDs and documentation in Markdown
- 🚀 Build interactive HTML prototypes with CSS and JavaScript
- 🔗 Share prototypes via shareable URLs with your team
- 💾 Store everything locally in your `content/` directory

Perfect for product managers, designers, and developers who want a simple, local-first approach to managing PRDs and prototyping.

## ✨ Features

### Document Management
- **Markdown Editor**: Create, edit, and preview markdown files with live preview
- **PRD Support**: Organize product requirements documents alongside your documentation
- **File Browser**: Navigate your content with an intuitive sidebar file browser
- **CRUD Operations**: Full create, read, update, and delete functionality

### Prototype Creation
- **Quick Prototyping**: Create new prototypes with a single click
- **Shareable URLs**: Each prototype gets its own route (`/prototypes/[name]`) that you can share
- **Asset Management**: Automatically inline CSS and JavaScript files referenced in your HTML
- **Sandboxed Execution**: Prototypes run in secure iframes for safety

### Developer Experience
- **Dark Mode**: Automatically follows your system preferences
- **TypeScript**: Fully typed for better development experience
- **Modern UI**: Built with Tailwind CSS for a clean, responsive interface

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
│   │   └── Instructions.tsx
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

### Creating Documents

1. Click the **"+ New Doc"** button in the header
2. Enter a filename (e.g., `my-prd.md`)
3. The file will be created in `content/docs and prds/`
4. Click the file in the sidebar to open it
5. Click **"Edit"** to modify the content
6. Click **"Save"** when done
7. Use **"Delete"** to remove files (with confirmation)

### Creating Prototypes

1. Click the **"+ New Prototype"** button in the header
2. Enter a prototype name (e.g., `my-app`)
3. The name will be sanitized for URL use
4. A new directory is created with a starter `index.html`

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

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is private and proprietary.

---

**Happy prototyping!** 🚀
