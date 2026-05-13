import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { checkRateLimit, getClientIP } from '../middleware';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Sanitizes and validates a file path to prevent path traversal attacks.
 * Ensures the resolved path stays within CONTENT_DIR.
 * @param userPath - The user-provided path (can be relative)
 * @returns The safe absolute path
 * @throws Error if path attempts to escape CONTENT_DIR
 */
function sanitizePath(userPath: string): string {
  // Normalize the path to remove any .. or . segments
  const normalized = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');

  // Resolve to absolute path within CONTENT_DIR
  const resolved = path.resolve(CONTENT_DIR, normalized);

  // Ensure the resolved path is within CONTENT_DIR
  if (!resolved.startsWith(CONTENT_DIR + path.sep) && resolved !== CONTENT_DIR) {
    throw new Error('Invalid path: Access denied');
  }

  return resolved;
}

export async function GET(request: Request) {
  // Rate limiting
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const dir = searchParams.get('dir') || '';
  const filePath = searchParams.get('path');

  try {
    // If path is provided, read the file
    if (filePath) {
      const fullPath = sanitizePath(filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return NextResponse.json({ content, type: 'file' });
    }

    // Otherwise, list directory contents
    const targetDir = dir ? sanitizePath(dir) : CONTENT_DIR;
    const entries = await fs.readdir(targetDir, { withFileTypes: true });

    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(targetDir, entry.name);
        const relativePath = path.relative(CONTENT_DIR, fullPath);
        const stats = await fs.stat(fullPath);

        return {
          name: entry.name,
          path: relativePath,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
    );

    return NextResponse.json({ items, type: 'directory' });
  } catch (error: any) {
    console.error('Error reading files:', error);

    // Handle path traversal attempts
    if (error.message === 'Invalid path: Access denied') {
      return NextResponse.json(
        { error: 'Invalid path: Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to read files' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }
    const body = JSON.parse(rawBody);
    const { path: filePath, content, isDirectory } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Validate file extension (only for files, not directories)
    if (!isDirectory && filePath) {
      const ext = path.extname(filePath).toLowerCase();
      // Allow common text/code file types
      const allowedExtensions = [
        '.md', '.txt', '.json', '.js', '.jsx', '.ts', '.tsx',
        '.html', '.css', '.scss', '.yaml', '.yml', '.xml',
        '.sh', '.py', '.rb', '.go', '.java', '.c', '.cpp',
        '.h', '.hpp', '.sql', '.env', '.gitignore', '.dockerignore',
        ''  // Allow files without extension
      ];

      if (ext && !allowedExtensions.includes(ext)) {
        return NextResponse.json(
          { error: `File type ${ext} not allowed. Only text and code files are permitted.` },
          { status: 400 }
        );
      }
    }

    const fullPath = sanitizePath(filePath);

    if (isDirectory) {
      await fs.mkdir(fullPath, { recursive: true });
      return NextResponse.json({ success: true, message: 'Directory created' });
    } else {
      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await fs.mkdir(parentDir, { recursive: true });
      await fs.writeFile(fullPath, content || '', 'utf-8');
      return NextResponse.json({ success: true, message: 'File created' });
    }
  } catch (error: any) {
    console.error('Error creating file/directory:', error);

    // Handle path traversal attempts
    if (error.message === 'Invalid path: Access denied') {
      return NextResponse.json(
        { error: 'Invalid path: Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create file/directory' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // Rate limiting
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }
    const body = JSON.parse(rawBody);
    const { path: filePath, content } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 }
      );
    }

    // Validate file extension (defense-in-depth, same allowlist as POST)
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = [
      '.md', '.txt', '.json', '.js', '.jsx', '.ts', '.tsx',
      '.html', '.css', '.scss', '.yaml', '.yml', '.xml',
      '.sh', '.py', '.rb', '.go', '.java', '.c', '.cpp',
      '.h', '.hpp', '.sql', '.env', '.gitignore', '.dockerignore',
      ''
    ];
    if (ext && !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `File type ${ext} not allowed. Only text and code files are permitted.` },
        { status: 400 }
      );
    }

    const fullPath = sanitizePath(filePath);
    await fs.writeFile(fullPath, content, 'utf-8');
    return NextResponse.json({ success: true, message: 'File updated' });
  } catch (error: any) {
    console.error('Error updating file:', error);

    // Handle path traversal attempts
    if (error.message === 'Invalid path: Access denied') {
      return NextResponse.json(
        { error: 'Invalid path: Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // Rate limiting
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    const fullPath = sanitizePath(filePath);
    
    // Check if path exists
    try {
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        await fs.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fullPath);
      }

      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (statError: any) {
      if (statError.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'File or directory does not exist' },
          { status: 404 }
        );
      }
      throw statError;
    }
  } catch (error: any) {
    console.error('Error deleting file/directory:', error);

    // Handle path traversal attempts
    if (error.message === 'Invalid path: Access denied') {
      return NextResponse.json(
        { error: 'Invalid path: Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete file/directory' },
      { status: 500 }
    );
  }
}
