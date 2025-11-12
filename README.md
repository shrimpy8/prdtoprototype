# Personal Productivity Hub

A simple Next.js app for managing markdown documents, PRDs, and interactive prototypes.

## Features

- 📄 **Markdown Documents & PRDs**: Create, edit, and delete markdown files with live preview
- 🚀 **Prototypes**: Create prototype directories that can be accessed via shareable routes
- ✏️ **CRUD Operations**: Full create, read, update, delete for markdown files
- 🔗 **Shareable Prototypes**: Each prototype gets its own URL route (`/prototypes/[name]`) that you can share with team members

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Directory Structure

The app uses a `content/` directory at the root with the following structure:

```
content/
  ├── docs and prds/    # Markdown documents and PRDs
  └── prototypes/       # Prototype directories (each with its own route)
      └── [prototype-name]/
          ├── index.html
          ├── style.css (optional)
          └── script.js (optional)
```

## Usage

### Documents (Markdown Files)

1. **Create a Document**: Click "+ New Doc" button, enter a filename
2. **Edit**: Click "Edit" button to modify the markdown content
3. **Save**: Click "Save" after editing
4. **Delete**: Click "Delete" button (with confirmation)

### Prototypes

1. **Create a Prototype**: 
   - Click "+ New Prototype" button
   - Enter a name (will be sanitized for URL)
   - A new directory is created with a starter `index.html`

2. **Access Your Prototype**:
   - Each prototype is accessible at: `/prototypes/[name]`
   - Example: `http://localhost:3000/prototypes/my-app`
   - Share this URL with your team members!

3. **Add Assets**:
   - Edit the `index.html` file in the prototype directory
   - Add CSS files (they'll be automatically inlined)
   - Add JS files (they'll be automatically inlined)
   - Reference them in HTML: `<link rel="stylesheet" href="style.css">` or `<script src="script.js"></script>`

## API Routes

- `GET /api/files?path=...` - Read a file
- `GET /api/files?dir=...` - List directory contents
- `POST /api/files` - Create a file or directory
- `PUT /api/files` - Update a file
- `DELETE /api/files?path=...` - Delete a file or directory

## Prototype Routes

Each prototype directory automatically gets a route:
- `/prototypes/[name]` - View the prototype

The route reads `index.html` and automatically inlines any CSS/JS files referenced in the HTML.

## Development

- **Build for production:**
  ```bash
  npm run build
  ```

- **Start production server:**
  ```bash
  npm start
  ```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React Markdown
- File System API (Node.js)

## Notes

- All content is stored locally in the `content/` directory
- The app reads files directly from the filesystem
- Prototypes run in sandboxed iframes for security
- Dark mode is automatically enabled based on system preferences
- Prototype routes are shareable URLs that team members can access
