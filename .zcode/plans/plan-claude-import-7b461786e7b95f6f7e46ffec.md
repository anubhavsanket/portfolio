## Plan to fix "card behind" and "flush" appearance of Calendar Widget

### 1. CSS Adjustments (`styles.css`)
- **Make wrapper flush**: Modify `.schedule-embed-wrapper` to have `background: transparent;` and `border: none;`. This removes the card-like appearance and allows the iframe to sit flush on the page.
- **Responsive Sizing**: Set `.schedule-embed-wrapper` to have `height: 600px;` (or a more responsive height) and ensure the `iframe` inside takes `width: 100%; height: 100%;`. This helps solve sizing/clipping issues.

### 2. JavaScript Refinement (`script.js`)
- **Optimization**: Currently, `renderCal` destroys and recreates the DOM container. Instead, I'll keep the DOM container but update the config directly if the API supports it, or at least minimize the flash of unstyled content during the re-render.
- **Refinement**: Ensure the `cal-embed` container is correctly sized initially.

### 3. Cleanup
- Remove the stale, unlinked `schedule-styles.css` and `cal-script.js` files to prevent future confusion.

---
This approach will remove the card background, ensure the widget fills the space cleanly without extra whitespace or scrollbars, and prevent the "background flash" on theme toggle.

Does this plan sound correct for what you want?