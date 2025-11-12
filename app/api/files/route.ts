import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dir = searchParams.get('dir') || '';
  const filePath = searchParams.get('path');

  try {
    // If path is provided, read the file
    if (filePath) {
      const fullPath = path.join(CONTENT_DIR, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return NextResponse.json({ content, type: 'file' });
    }

    // Otherwise, list directory contents
    const targetDir = dir ? path.join(CONTENT_DIR, dir) : CONTENT_DIR;
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
  } catch (error) {
    console.error('Error reading files:', error);
    return NextResponse.json(
      { error: 'Failed to read files' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path: filePath, content, isDirectory } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    const fullPath = path.join(CONTENT_DIR, filePath);

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
  } catch (error) {
    console.error('Error creating file/directory:', error);
    return NextResponse.json(
      { error: 'Failed to create file/directory' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { path: filePath, content } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 }
      );
    }

    const fullPath = path.join(CONTENT_DIR, filePath);
    await fs.writeFile(fullPath, content, 'utf-8');
    return NextResponse.json({ success: true, message: 'File updated' });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    const fullPath = path.join(CONTENT_DIR, filePath);
    
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
  } catch (error) {
    console.error('Error deleting file/directory:', error);
    return NextResponse.json(
      { error: 'Failed to delete file/directory' },
      { status: 500 }
    );
  }
}
