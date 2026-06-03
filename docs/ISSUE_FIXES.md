# Code Review: Issue Fixes

> Auto-generated code review. Each issue includes a surgical fix for Sonnet to apply.
> Fixes are ordered by severity: Critical > High > Medium > Low.

## Summary
- Critical: 2
- High: 3
- Medium: 4
- Low: 3
- Total: 12

---

## Critical Issues

### C-1: XSS via Unsanitized Prototype Name in HTML Template
**File:** `app/page.tsx` (lines 154-176)
**Problem:** When creating a new prototype, the user-provided `prototypeName` is injected directly into an HTML template string without any escaping. The name appears in `<title>`, `<h1>`, and a `<script>` block. A name like `</title><script>alert(1)</script>` would execute arbitrary JavaScript.
**Fix:**
```typescript
// OLD (lines 154-176) — the template uses raw prototypeName in 3 places:
//   <title>${prototypeName}</title>
//   <h1>${prototypeName}</h1>
//   console.log('Prototype: ${prototypeName}');

// NEW — add this helper function before handleCreatePrototype:
const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const escapeJs = (str: string): string =>
  str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"')
    .replace(/</g, '\\x3c').replace(/>/g, '\\x3e').replace(/\n/g, '\\n');

// Then update the template to use escaped values:
//   <title>${escapeHtml(prototypeName)}</title>
//   <h1>${escapeHtml(prototypeName)}</h1>
//   console.log('Prototype: ${escapeJs(prototypeName)}');
```
Specifically, change lines 159, 170, and 174:
```typescript
// Line 159
    <title>${escapeHtml(prototypeName)}</title>
// Line 170
    <h1>${escapeHtml(prototypeName)}</h1>
// Line 174
        console.log('Prototype: ${escapeJs(prototypeName)}');
```
**Why:** This is a stored XSS vulnerability. The malicious HTML is written to disk and served to anyone who opens the prototype page.

---

### C-2: Sandbox Attribute Combination Negates Iframe Security
**File:** `app/components/PrototypeViewer.tsx` (line 62) and `app/prototypes/[name]/page.tsx` (line 118)
**Problem:** Both iframe elements use `sandbox="allow-scripts allow-same-origin"`. When these two flags are combined, the sandboxed content runs with full access to the parent origin — it can remove its own sandbox attribute, access parent cookies, localStorage, and make authenticated API calls (including DELETE operations on the file API).
**Fix:**
```typescript
// In app/components/PrototypeViewer.tsx, line 62
// OLD
sandbox="allow-scripts allow-same-origin"
// NEW
sandbox="allow-scripts"

// In app/prototypes/[name]/page.tsx, line 118
// OLD
sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
// NEW
sandbox="allow-scripts allow-forms allow-popups"
```
**Why:** The MDN docs explicitly warn: "When the embedded document has the same origin as the embedding page, it is strongly discouraged to use both allow-scripts and allow-same-origin, as that lets the embedded document remove the sandbox attribute." A malicious prototype could delete all files via the file API.

---

## High Issues

### H-1: Path Traversal in Prototype Page Server Component
**File:** `app/prototypes/[name]/page.tsx` (lines 11-51)
**Problem:** The `getPrototype()` function takes the `name` URL parameter and uses it directly to construct a file path: `path.join(CONTENT_DIR, 'prototypes', name)`. While `path.join` normalizes `..`, it doesn't prevent traversal — `name` could be `../../etc` which would resolve outside CONTENT_DIR. The `sanitizePath` function in the API route is not used here.
**Fix:**
```typescript
// OLD (lines 11-14)
async function getPrototype(name: string) {
  try {
    const prototypeDir = path.join(CONTENT_DIR, 'prototypes', name);
    const indexPath = path.join(prototypeDir, 'index.html');

// NEW
async function getPrototype(name: string) {
  try {
    // Reject any path traversal characters
    if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes('\0')) {
      return null;
    }
    const prototypeDir = path.join(CONTENT_DIR, 'prototypes', name);
    // Verify resolved path is within expected directory
    const prototypesRoot = path.join(CONTENT_DIR, 'prototypes');
    if (!prototypeDir.startsWith(prototypesRoot + path.sep)) {
      return null;
    }
    const indexPath = path.join(prototypeDir, 'index.html');
```
**Why:** The file API route has path traversal protection, but the prototype server component bypasses it entirely by reading files directly. An attacker could read arbitrary files on the server.

---

### H-2: Rate Limit Map Never Pruned — Memory Leak
**File:** `app/api/middleware.ts` (lines 10-43)
**Problem:** The `rateLimit` Map stores entries for every IP that has ever made a request. Expired entries (where `now > record.resetTime`) are only overwritten when the same IP makes another request. IPs that make a single request and never return leave orphaned entries forever. Under sustained traffic from diverse IPs, this grows without bound.
**Fix:**
```typescript
// OLD (lines 10-11)
const rateLimit = new Map<string, RateLimitRecord>();

// NEW — add cleanup logic
const rateLimit = new Map<string, RateLimitRecord>();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function pruneExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [ip, record] of rateLimit) {
    if (now > record.resetTime) {
      rateLimit.delete(ip);
    }
  }
}

// Then add at the start of checkRateLimit function (after line 24):
export function checkRateLimit(
  ip: string,
  requests: number = 100,
  windowMs: number = 60000
): boolean {
  pruneExpiredEntries();  // <-- ADD THIS LINE
  const now = Date.now();
```
**Why:** In a long-running Next.js server process, the Map will grow unboundedly. At 1000 unique IPs/hour, this is ~24K orphaned entries/day.

---

### H-3: Rate Limit Bypass via X-Forwarded-For Spoofing
**File:** `app/api/middleware.ts` (lines 50-65)
**Problem:** `getClientIP` trusts the `x-forwarded-for` header unconditionally. Any client can send a different `X-Forwarded-For` value on each request to get a fresh rate limit bucket, completely bypassing rate limiting.
**Fix:**
```typescript
// OLD (lines 50-55)
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

// NEW — only trust forwarded headers in production behind a known proxy
export function getClientIP(request: Request): string {
  // In production behind a reverse proxy, the proxy sets x-forwarded-for.
  // In development or direct access, use a fingerprint fallback.
  // Note: This is still spoofable without a trusted proxy that strips client-set headers.
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    // Take the LAST IP (closest to our server, set by our proxy) not the first (set by client)
    return ips[ips.length - 1];
  }
```
**Why:** Taking the first IP in X-Forwarded-For trusts the client. Taking the last IP trusts the most-recent proxy (your own). This is a well-known rate-limit bypass technique.

---

## Medium Issues

### M-1: PUT Endpoint Missing File Extension Validation
**File:** `app/api/files/route.ts` (lines 173-223)
**Problem:** The POST handler (line 124-141) validates file extensions against an allowlist, but the PUT handler has no extension check. A file created as `.md` could be overwritten with a `.exe` extension via PUT, or an attacker could update a path like `../../malicious.sh` (though sanitizePath prevents traversal, the extension check is still missing as defense-in-depth).
**Fix:**
```typescript
// OLD (lines 195-206) — after getting filePath and content from body:
    const fullPath = sanitizePath(filePath);
    await fs.writeFile(fullPath, content, 'utf-8');

// NEW — add extension validation before sanitizePath:
    // Validate file extension
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
```
**Why:** Defense-in-depth. POST validates extensions; PUT should too for consistency. Otherwise an attacker who finds a way to control the path param can write arbitrary file types.

---

### M-2: Content-Length Size Check Is Bypassable
**File:** `app/api/files/route.ts` (lines 103-111, 186-194)
**Problem:** Both POST and PUT check `Content-Length` header to enforce the 10MB limit. But `Content-Length` is optional — a client can omit it (or use chunked transfer encoding) and send an arbitrarily large body. The body is then fully parsed by `request.json()`.
**Fix:**
```typescript
// OLD (lines 103-111)
    const contentLength = request.headers.get('content-length');
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }

    const body = await request.json();

// NEW — validate after parsing instead of (or in addition to) before
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
```
Apply to both POST (lines 103-113) and PUT (lines 186-195).
**Why:** The header check is a hint, not enforcement. Checking the actual body size after reading it prevents the bypass.

---

### M-3: DRY Violation — Delete Confirmation Dialog Duplicated
**File:** `app/components/FileBrowser.tsx` (lines 288-340) and `app/components/PrototypesListView.tsx` (lines 230-283)
**Problem:** The delete confirmation dialog markup is nearly identical (~50 lines) across both components, including the spinner SVG, button states, and layout. Any UI change needs updating in two places.
**Fix:**
Create a shared component:
```typescript
// NEW FILE: app/components/DeleteConfirmDialog.tsx
'use client';

interface DeleteConfirmDialogProps {
  itemName: string;
  itemType: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  itemName,
  itemType,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Delete {itemType}?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to delete <strong>&quot;{itemName}&quot;</strong>?
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mb-6">
          This will permanently delete the {itemType.toLowerCase()} and all its files. This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : `Delete ${itemType}`}
          </button>
        </div>
      </div>
    </div>
  );
}
```
Then replace the dialog markup in both FileBrowser.tsx and PrototypesListView.tsx with:
```tsx
{deleteConfirm && (
  <DeleteConfirmDialog
    itemName={deleteConfirm.name}
    itemType="Prototype"
    isDeleting={isDeleting}
    onConfirm={handleDeleteConfirm}
    onCancel={() => setDeleteConfirm(null)}
  />
)}
```
**Why:** ~100 lines of duplicated UI code. If the dialog design changes (e.g., adding an undo feature), both files must be updated independently.

---

### M-4: DRY Violation — `getPrototypeName` Duplicated
**File:** `app/components/FileBrowser.tsx` (lines 175-179) and `app/components/PrototypesListView.tsx` (lines 58-61)
**Problem:** The same `getPrototypeName` function is copy-pasted in both components.
**Fix:**
```typescript
// NEW — add to a shared utility, e.g., app/lib/utils.ts (or create it):
export function getPrototypeName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}
```
Then import in both components:
```typescript
import { getPrototypeName } from '../lib/utils';
```
And remove the local `getPrototypeName` functions from both files.
**Why:** Trivial function but duplicated logic can drift if one is updated and the other isn't.

---

## Low Issues

### L-1: Missing `aria-label` on Interactive SVG Buttons
**File:** `app/components/FileBrowser.tsx` (lines 240-278) and `app/components/PrototypesListView.tsx` (lines 191-216)
**Problem:** The "Open in New Tab" and "Delete" buttons contain only SVG icons with no text content. Screen readers cannot determine the button's purpose. While `title` attributes exist on some buttons, `aria-label` is the standard approach.
**Fix:**
```tsx
// In FileBrowser.tsx line 241
// OLD
<button
  onClick={(e) => handleOpenPrototype(item, e)}
  className="open-prototype-button ..."
  title={`Open ${item.name} in new tab`}
>

// NEW
<button
  onClick={(e) => handleOpenPrototype(item, e)}
  className="open-prototype-button ..."
  title={`Open ${item.name} in new tab`}
  aria-label={`Open ${item.name} in new tab`}
>
```
Apply `aria-label` to all icon-only buttons in both files.
**Why:** Accessibility. Icon-only buttons are invisible to screen readers without `aria-label`.

---

### L-2: Suppressed ESLint Exhaustive-Deps Warning
**File:** `app/components/FileBrowser.tsx` (lines 73-75)
**Problem:** `// eslint-disable-next-line react-hooks/exhaustive-deps` suppresses a warning about `currentDir` missing from the dependency array of a `useEffect` that calls `loadDirectory(currentDir)`.
**Fix:**
```typescript
// OLD (lines 70-75)
  useEffect(() => {
    if (refreshKey !== undefined) {
      loadDirectory(currentDir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

// NEW — use a ref to track currentDir without triggering re-renders
// Add near the top of the component:
const currentDirRef = useRef(currentDir);
currentDirRef.current = currentDir;

// Then update the effect:
  useEffect(() => {
    if (refreshKey !== undefined) {
      loadDirectory(currentDirRef.current);
    }
  }, [refreshKey]);
```
**Why:** ESLint suppressions hide potential bugs. Using a ref satisfies the exhaustive-deps rule while preserving the intended behavior (only re-run when refreshKey changes, reading the current directory at that moment).

---

### L-3: `loadDirectory` Not Stable Reference for useEffect
**File:** `app/components/FileBrowser.tsx` (line 29)
**Problem:** `loadDirectory` is defined as a regular function inside the component. It's called inside `useEffect` but not listed as a dependency (hidden by the eslint-disable). If the component re-renders, a new `loadDirectory` is created each time, which is fine functionally but violates React best practices.
**Fix:**
```typescript
// Wrap loadDirectory with useCallback:
// OLD (line 29)
  const loadDirectory = async (dir: string = '') => {

// NEW
  const loadDirectory = useCallback(async (dir: string = '') => {
    // ... existing body unchanged ...
  }, []);  // No deps — it only uses setters and fetch
```
Add `useCallback` to the import from React:
```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
```
**Why:** Stabilizing the function reference enables proper dependency tracking in useEffect and prevents unnecessary re-creations on each render.

---

---

## Resolutions

All 12 issues fixed and validated via `npx tsc --noEmit` (0 errors) and `npm run lint` (0 warnings).

### Critical Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| C-1 | ✅ Fixed | `app/page.tsx`: added `escapeHtml()` and `escapeJs()` helpers; all three template insertions (`<title>`, `<h1>`, `console.log`) now use the appropriate escape function before injecting `prototypeName` into the HTML string |
| C-2 | ✅ Fixed | `app/components/PrototypeViewer.tsx`: removed `allow-same-origin` → `sandbox="allow-scripts"`. `app/prototypes/[name]/page.tsx`: removed `allow-same-origin` → `sandbox="allow-scripts allow-forms allow-popups"` |

### High Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| H-1 | ✅ Fixed | `app/prototypes/[name]/page.tsx` `getPrototype()`: added early rejection of `..`, `/`, `\\`, `\0` in `name`; added secondary `startsWith(prototypesRoot + path.sep)` boundary check before any file access |
| H-2 | ✅ Fixed | `app/api/middleware.ts`: added `pruneExpiredEntries()` that runs every 5 minutes, iterating the map and deleting expired records; called at the top of `checkRateLimit()` |
| H-3 | ✅ Fixed | `app/api/middleware.ts` `getClientIP()`: changed from `ips[0]` (client-controlled) to `ips[ips.length - 1]` (last proxy hop set by our server) |

### Medium Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| M-1 | ✅ Fixed | `app/api/files/route.ts` PUT handler: added same extension allowlist check as POST — rejects disallowed extensions with 400 before calling `sanitizePath` |
| M-2 | ✅ Fixed | `app/api/files/route.ts` POST and PUT: replaced `request.json()` with `request.text()` + explicit `rawBody.length > MAX_SIZE` check + `JSON.parse(rawBody)` — body size now enforced regardless of `Content-Length` header |
| M-3 | ✅ Fixed | Created `app/components/DeleteConfirmDialog.tsx` (shared component with spinner); replaced ~50-line inline dialog blocks in both `FileBrowser.tsx` and `PrototypesListView.tsx` with `<DeleteConfirmDialog .../>` |
| M-4 | ✅ Fixed | Created `app/lib/utils.ts` with `getPrototypeName()`; removed local definitions from `FileBrowser.tsx` (line 175-179) and `PrototypesListView.tsx` (lines 58-61); both files now import from `../lib/utils` |

### Low Issues

| Issue | Status | Fix Summary |
|-------|--------|-------------|
| L-1 | ✅ Fixed | Added `aria-label` to all icon-only buttons: open-prototype and delete buttons in `FileBrowser.tsx`; open and delete buttons in `PrototypesListView.tsx` |
| L-2 | ✅ Fixed | `FileBrowser.tsx`: added `currentDirRef` (`useRef`) that tracks `currentDir`; removed `eslint-disable-next-line` suppression; `useEffect` reads `currentDirRef.current` instead of capturing stale `currentDir` |
| L-3 | ✅ Fixed | `FileBrowser.tsx`: wrapped `loadDirectory` with `useCallback(async () => {...}, [])` (no deps — only uses setters and `fetch`); added `useCallback` to React import; added `loadDirectory` to `useEffect` dependency arrays |

---

## Additional Fixes

Codebase scan after completing the 12 issues found no new patterns — all security, DRY, and accessibility checks passed cleanly. No additional fixes required.

---

## Repository Structure Observations

1. **Flat component directory:** All components live in `app/components/` regardless of type. As the app grows, consider organizing into subdirectories:
   ```
   app/components/
   ├── editor/         # MarkdownEditor, MarkdownViewer
   ├── browser/        # FileBrowser, DocumentsListView, PrototypesListView
   ├── prototype/      # PrototypeViewer
   └── shared/         # DeleteConfirmDialog, Instructions
   ```

2. **No `lib/` or `utils/` directory:** Shared utilities (like `getPrototypeName`, `escapeHtml`) have nowhere to live, leading to duplication in components. Creating `app/lib/utils.ts` would give a natural home for these.

3. **Content directory checked into repo:** The `content/` directory with sample prototypes and docs is version-controlled. For a tool that's designed to create user content, consider:
   - Adding `content/` to `.gitignore` (except a `content/.gitkeep` or a seed script)
   - Providing a `scripts/seed-content.sh` to generate starter content on first run

4. **No `CLAUDE.md` or project-level configuration:** Unlike the other reviewed projects, this one has no `CLAUDE.md` for project conventions, constraints, or architectural decisions.

5. **`agents/prd.md`** exists as a standalone file — if this is an AI agent prompt, it might belong in a dedicated `prompts/` or `.ai/` directory to make the pattern clear.
