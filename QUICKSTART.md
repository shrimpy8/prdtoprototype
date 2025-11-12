# Quick Start Guide

## First Time Setup

1. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Go to [http://localhost:3000](http://localhost:3000)

## What You'll See

- **Left Sidebar**: File browser showing your content directories
- **Main Area**: Content viewer that changes based on file type
  - Markdown files → Formatted preview
  - Code files → Syntax-highlighted code view
  - HTML prototypes → Live preview in sandboxed iframe

## Sample Files Included

The app comes with sample files to get you started:

- `content/docs/welcome.md` - Welcome document
- `content/prds/example-prd.md` - Example PRD
- `content/code/example.js` - Example code file
- `content/prototypes/hello-world/index.html` - Sample prototype

## Adding Your Own Content

### Adding a Document
1. Create a `.md` file in `content/docs/` or `content/prds/`
2. Refresh the app or navigate to the file in the sidebar
3. Click the file to view it

### Adding Code
1. Add any code file (`.js`, `.ts`, `.py`, etc.) to `content/code/`
2. Click it in the sidebar to view with syntax highlighting

### Creating a Prototype
1. Create a new folder in `content/prototypes/` (e.g., `my-app/`)
2. Add an `index.html` file inside
3. Optionally add CSS/JS files and reference them in the HTML
4. Click the HTML file in the sidebar to see it run

## Tips

- Use the "Back" button in the sidebar to navigate up directories
- Files are organized by type in separate directories
- Prototypes run in sandboxed iframes for security
- Dark mode follows your system preferences

## Troubleshooting

**Files not showing up?**
- Make sure files are in the `content/` directory
- Check file permissions
- Refresh the browser

**Prototype not loading?**
- Ensure the HTML file is named `index.html`
- Check browser console for errors
- Verify the HTML is valid

**Build errors?**
- Run `npm install` again
- Check Node.js version (requires Node 18+)
- Clear `.next` folder and rebuild

