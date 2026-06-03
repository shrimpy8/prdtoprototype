import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { realpath } from 'fs/promises';
import { checkRateLimit, getClientIP } from '../middleware';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// PTP-03: Protected top-level directories that cannot be deleted
const PROTECTED_DIRS = ['docs and prds', 'prototypes'];

// PTP-04: Per-folder extension allowlists
const DOCS_EXTENSIONS = ['.md', '.txt', '.json', '.yaml', '.yml'];
const PROTOTYPE_EXTENSIONS = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];

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

/**
 * PTP-05: Verifies the real (symlink-resolved) path stays within CONTENT_DIR.
 * @param fullPath - The already lexically-sanitized absolute path
 * @returns The real path string, or null if it resolves outside CONTENT_DIR or does not exist
 */
async function verifyRealPath(fullPath: string): Promise<string | null> {
  const real = await realpath(fullPath).catch(() => null);
  if (!real) return null;
  if (!real.startsWith(CONTENT_DIR + path.sep) && real !== CONTENT_DIR) {
    return null;
  }
  return real;
}

/**
 * PTP-01: CSRF / Origin check for mutation operations.
 * Returns a Response to reject, or null when the request is allowed.
 *
 * Allow rules (checked in order):
 *  1. If PRDTP_WRITE_TOKEN is set and the request provides a matching X-Write-Token → allow (API key path)
 *  2. If Origin is present → must match Host
 *  3. If Referer is present → must match Host
 *  4. If NEITHER Origin nor Referer is present → reject (no ambient context to trust)
 *
 * For POST/PUT, Content-Type must be application/json (DELETE skips this — it has no body).
 */
function assertWriteAllowed(request: Request, requireContentType = true): Response | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  const contentType = request.headers.get('content-type');
  const writeToken = request.headers.get('x-write-token');

  // API key path: if a write token is configured and matches, allow regardless of Origin/Referer
  const configuredToken = process.env.PRDTP_WRITE_TOKEN;
  if (configuredToken && writeToken === configuredToken) {
    // Still enforce Content-Type for POST/PUT even on the token path
    if (requireContentType && (!contentType || !contentType.includes('application/json'))) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }
    return null; // allowed via token
  }

  // Require JSON content type for POST/PUT
  if (requireContentType) {
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }
  }

  // Check origin/referer matches host (CSRF protection)
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: 'Cross-origin requests not allowed' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        return NextResponse.json({ error: 'Cross-origin requests not allowed' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid referer' }, { status: 403 });
    }
  } else {
    // Neither Origin nor Referer present — reject to prevent CSRF via form-submit or bare curl
    return NextResponse.json({ error: 'Missing origin or referer' }, { status: 403 });
  }

  return null; // allowed
}

/**
 * PTP-06: Parses JSON safely and returns a typed result.
 * Returns { ok: true, value } on success or { ok: false, response } on parse error.
 */
function parseJsonBody(rawBody: string): { ok: true; value: unknown } | { ok: false; response: Response } {
  try {
    return { ok: true, value: JSON.parse(rawBody) };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
      };
    }
    throw e;
  }
}

/**
 * PTP-04: Validates the file extension against the appropriate per-folder allowlist.
 * @param filePath - Relative file path provided by the user
 * @returns A 400 Response if rejected, or null if allowed
 */
function validateExtension(filePath: string): Response | null {
  const ext = path.extname(filePath).toLowerCase();
  const segments = filePath.replace(/\\/g, '/').split('/');
  const topFolder = segments[0];

  let allowed: string[];
  if (topFolder === 'prototypes') {
    allowed = PROTOTYPE_EXTENSIONS;
  } else {
    // Default to docs allowlist for "docs and prds" and any other folder
    allowed = DOCS_EXTENSIONS;
  }

  if (!allowed.includes(ext)) {
    return NextResponse.json(
      { error: `File type "${ext || '(none)'}" not allowed in this directory` },
      { status: 400 }
    );
  }

  return null;
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

      // PTP-05: realpath check
      const realResolved = await verifyRealPath(fullPath);
      if (!realResolved) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const content = await fs.readFile(realResolved, 'utf-8');
      return NextResponse.json({ content, type: 'file' });
    }

    // Otherwise, list directory contents
    const targetDir = dir ? sanitizePath(dir) : CONTENT_DIR;

    // PTP-05: realpath check on target directory
    const realTargetDir = await verifyRealPath(targetDir);
    if (!realTargetDir) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const entries = await fs.readdir(realTargetDir, { withFileTypes: true });

    const itemsRaw = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(realTargetDir, entry.name);
        const relativePath = path.relative(CONTENT_DIR, fullPath);
        // PTP-05: use lstat so we see the symlink itself, not the target
        const stats = await fs.lstat(fullPath);

        // PTP-05b: skip symlinks — never expose them in directory listings
        if (stats.isSymbolicLink()) {
          return null;
        }

        return {
          name: entry.name,
          path: relativePath,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
    );
    // Filter out nulls (symlinks that were skipped)
    const items = itemsRaw.filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({ items, type: 'directory' });
  } catch (error: unknown) {
    console.error('Error reading files:', error);

    // Handle path traversal attempts
    if (error instanceof Error && error.message === 'Invalid path: Access denied') {
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

  // PTP-01: CSRF / origin check
  const writeError = assertWriteAllowed(request);
  if (writeError) return writeError;

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

    // PTP-06: safe JSON parse
    const parsed = parseJsonBody(rawBody);
    if (!parsed.ok) return parsed.response;
    const body = parsed.value as Record<string, unknown>;
    const { path: filePath, content, isDirectory } = body;

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // PTP-04: Validate file extension (only for files, not directories)
    if (!isDirectory) {
      const extError = validateExtension(filePath);
      if (extError) return extError;
    }

    const fullPath = sanitizePath(filePath);

    if (isDirectory) {
      await fs.mkdir(fullPath, { recursive: true });
      return NextResponse.json({ success: true, message: 'Directory created' });
    } else {
      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await fs.mkdir(parentDir, { recursive: true });
      await fs.writeFile(fullPath, typeof content === 'string' ? content : '', 'utf-8');
      return NextResponse.json({ success: true, message: 'File created' });
    }
  } catch (error: unknown) {
    console.error('Error creating file/directory:', error);

    // Handle path traversal attempts
    if (error instanceof Error && error.message === 'Invalid path: Access denied') {
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

  // PTP-01: CSRF / origin check
  const writeError = assertWriteAllowed(request);
  if (writeError) return writeError;

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

    // PTP-06: safe JSON parse
    const parsed = parseJsonBody(rawBody);
    if (!parsed.ok) return parsed.response;
    const body = parsed.value as Record<string, unknown>;
    const { path: filePath, content } = body;

    if (!filePath || typeof filePath !== 'string' || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 }
      );
    }

    // PTP-04: Validate file extension
    const extError = validateExtension(filePath);
    if (extError) return extError;

    const fullPath = sanitizePath(filePath);
    await fs.writeFile(fullPath, typeof content === 'string' ? content : '', 'utf-8');
    return NextResponse.json({ success: true, message: 'File updated' });
  } catch (error: unknown) {
    console.error('Error updating file:', error);

    // Handle path traversal attempts
    if (error instanceof Error && error.message === 'Invalid path: Access denied') {
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

  // PTP-01: CSRF / origin check (no body for DELETE, skip content-type requirement)
  const deleteWriteError = assertWriteAllowed(request, false);
  if (deleteWriteError) return deleteWriteError;

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

    // PTP-03: Reject deletion of CONTENT_DIR itself
    if (fullPath === CONTENT_DIR) {
      return NextResponse.json(
        { error: 'Cannot delete protected directory' },
        { status: 403 }
      );
    }

    // PTP-03: Reject deletion of protected top-level directories
    for (const protectedDir of PROTECTED_DIRS) {
      const protectedPath = path.join(CONTENT_DIR, protectedDir);
      if (fullPath === protectedPath) {
        return NextResponse.json(
          { error: 'Cannot delete protected directory' },
          { status: 403 }
        );
      }
    }

    // PTP-05: realpath check to prevent symlink escape
    const realResolved = await verifyRealPath(fullPath);
    if (!realResolved) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if path exists
    try {
      const stats = await fs.stat(realResolved);

      if (stats.isDirectory()) {
        await fs.rm(realResolved, { recursive: true, force: true });
      } else {
        await fs.unlink(realResolved);
      }

      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (statError: unknown) {
      if ((statError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json(
          { error: 'File or directory does not exist' },
          { status: 404 }
        );
      }
      throw statError;
    }
  } catch (error: unknown) {
    console.error('Error deleting file/directory:', error);

    // Handle path traversal attempts
    if (error instanceof Error && error.message === 'Invalid path: Access denied') {
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
