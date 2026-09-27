## Readiness Fix Plan

### 1. Fix Git Remote (`origin` vs `prototype`)
- Set `origin` to `https://github.com/anubhavsanket/portfolio.git`
- Remove `prototype` remote if possible, or just ignore it.

### 2. Restore Performance & Add CDN Guards (`script.js`)
- Restore `script.js` to match committed performance optimization (`9176869`).
- Wrap GSAP and Cal.com library calls in `typeof` guards.
- Ensure the `applyCalTheme` logic is kept lean.

### 3. FOUC Fix (`index.html`)
- Extract the current theme read/set logic into a small, blocking `<script>` element inside `<head>` to prevent Flash of Unstyled Content (FOUC).
- Wrap theme read in a `try/catch` block for storage-disabled browser contexts.

### 4. Final Cleanup
- Add a proper `.gitignore` (which I already did, but ensure it's correct).
- Perform a final `git add` and `git commit` before pushing to `origin/main`.