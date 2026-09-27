## Plan: Speed Up Calendar Theme Switching

### Root Cause
The current `renderCal()` function wipes the `#cal-embed` container and re-creates the entire Cal.com iframe on every theme toggle. This forces the browser to re-download and re-execute the whole Cal booking app — that's the multi-second delay.

Cal.com's embed API was designed for this: the `ui` command sends a `postMessage` to the **existing** iframe and re-themes it in place (React state update + CSS variable swap). No reload. It even supports registering both light and dark palettes up front via `cssVarsPerTheme`, so switching is instant.

### Changes (script.js only)

1. **Create the iframe exactly once** — call `Cal.ns['quick-call']('inline', {...})` once at load, with the initial theme in `config`. Never touch `container.innerHTML` again.

2. **Replace `renderCal(theme)` with a lightweight `applyCalTheme(theme)`** that only calls:
   ```js
   Cal.ns['quick-call']('ui', {
       theme: calTheme,
       cssVarsPerTheme: {
           light: { 'cal-brand': '#1d00ff' },
           dark:  { 'cal-brand': '#E2FF00' }
       }
   });
   ```
   This registers both palettes (so subsequent switches are instant) and posts the theme change to the live iframe.

3. **Update the toggle handler** to call `applyCalTheme(next)` instead of `renderCal(next)`.

4. Remove the debug `console.log` left in from previous debugging.

### What this fixes
- Theme switch becomes near-instant (a postMessage, not a full app reload)
- No flash of empty container during toggle
- Booking state / scroll position inside the widget is preserved on toggle
- Both brand accent colors (yellow in dark, blue in light) still applied per theme

### Risks / fallback
Earlier attempts at the `ui`-only path appeared to be ignored — but those attempts also had `config.theme` passed at `inline` time and mixed both `Cal('ui')` and `Cal.ns[...]('ui')` calls in the same handler, which can conflict. This time: one clean `inline` init, and a single `ui` call per toggle on the namespaced instance, matching Cal.com's documented API. If the widget still refuses the live update (e.g., an embed.js caching quirk), the fallback is keeping the re-render path — but per Cal.com's source, `ui` is explicitly queued and re-applied across iframe resets, so it should work.

No HTML or CSS changes needed.