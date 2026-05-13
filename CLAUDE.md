# CLAUDE.md — prdtoprototype

## Stack
- Next.js 16 App Router, TypeScript strict mode
- Node.js `fs` API (server-side file system — all content under `content/`)
- Tailwind CSS v4
- react-markdown + remark-gfm
- gray-matter (frontmatter parsing)
- No database — file system is the store

## Commands
```bash
npm run dev        # start dev server
npm run build      # type-check + build — run before marking done
npm run lint       # eslint
npx tsc --noEmit   # type check only
```

## Project Structure
```
app/
  api/
    files/route.ts      # file system CRUD; rate limiting + body size enforcement
    middleware.ts        # rate limit Map with periodic pruning
  components/
    FileBrowser.tsx          # sidebar file tree
    MarkdownEditor.tsx       # markdown edit/preview
    PrototypeViewer.tsx      # iframe preview of a single HTML file
    PrototypesListView.tsx   # grid view of all prototypes
    DocumentsListView.tsx    # list view of all docs
    DeleteConfirmDialog.tsx  # shared delete confirmation dialog (use this, don't inline)
  lib/
    utils.ts            # getPrototypeName() and other pure helpers
  prototypes/[name]/
    page.tsx            # full-page iframe for a prototype (SSR)
content/
  prototypes/   # each prototype = a subdirectory with index.html + assets
  docs and prds/  # markdown files
```

## Security Invariants (non-negotiable)

### Path traversal — reject before joining
Any user-supplied path segment (URL param, request body field) used in `path.join()` must be validated before use:
```typescript
if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes('\0')) {
  return null; // or 400
}
const target = path.join(ROOT, name);
if (!target.startsWith(ROOT + path.sep)) {
  return null; // boundary check catches edge cases the char check misses
}
```
Both the character check **and** the boundary check are required — neither alone is sufficient.

### Iframe sandbox — never combine allow-scripts + allow-same-origin
- `sandbox="allow-scripts allow-same-origin"` negates the sandbox entirely (scripts get same-origin privileges)
- Correct: `sandbox="allow-scripts"` (plus `allow-forms`, `allow-popups` as needed — but never `allow-same-origin`)
- This applies to **every** `<iframe>` in the codebase: `PrototypeViewer.tsx`, `prototypes/[name]/page.tsx`, anywhere else

### XSS — escape before injecting into HTML template strings
Any user-supplied string embedded in a `\`...\`` HTML template must be escaped:
```typescript
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const escapeJs = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"')
   .replace(/</g, '\\x3c').replace(/>/g, '\\x3e').replace(/\n/g, '\\n');
```
Use `escapeHtml` for values in HTML attributes/content; use `escapeJs` for values inside `<script>` string literals.

### Body size enforcement
- `app/api/files/route.ts` POST and PUT use `request.text()` + `.length` check before `JSON.parse()`
- `Content-Length` is optional — never use it as the guard
- Limit constant: `MAX_SIZE = 10 * 1024 * 1024`; return 413 if exceeded

### Rate limiter — correct IP extraction + memory cleanup
- Client IP from `X-Forwarded-For`: use **last** IP (`ips[ips.length - 1]`), not first — the first IP is client-controlled and trivially spoofed
- Rate limit `Map` must be pruned periodically — entries for expired windows accumulate forever otherwise
- Pruning runs at the top of `checkRateLimit()` every `CLEANUP_INTERVAL` (5 min); touch `lastCleanup` timestamp

## React / Component Patterns

### Shared UI — use existing components, don't inline
- Delete confirmation dialogs → `DeleteConfirmDialog.tsx`; do not write inline confirm dialogs in individual components
- Prototype name extraction (last path segment) → `getPrototypeName()` from `app/lib/utils.ts`

### Stale closures in effects — useCallback + useRef
When a `useEffect` depends on a value that changes but the effect should not re-run on every change, use the `useRef` mirror pattern:
```typescript
const currentDirRef = useRef(currentDir);
currentDirRef.current = currentDir;
const loadDirectory = useCallback(async (dir: string) => {
  // read currentDirRef.current — not currentDir — inside here
}, []); // stable reference
```
Do **not** add `// eslint-disable-next-line` to suppress the exhaustive-deps warning — fix the stale closure instead.

### eslint-disable — treat as TODO(1)
Every `eslint-disable` comment is a deferred bug. Fix the root cause; never ship a suppression.

### Accessibility
- Every icon-only button requires `aria-label` describing its action
- Applies to open-in-new-tab buttons, delete buttons, and any other button lacking visible text

## Quality Gates (Before Commit)
- `npm run build` passes (catches type errors + missing routes)
- `npm run lint` passes; zero `eslint-disable` suppressions
- No `<iframe sandbox>` with both `allow-scripts` and `allow-same-origin`
- Path traversal guard present on every user-supplied segment used in `path.join()`
- XSS escaping applied to every user string injected into HTML template literals
- Body size check present in all POST/PUT handlers that call `JSON.parse()`
- Rate limit `Map` has periodic pruning and uses last X-Forwarded-For IP
