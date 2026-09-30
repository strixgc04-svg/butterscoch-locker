# Store Lock

A remote ON/OFF lock for a Shopify storefront. When it's on, the store is covered by a full-screen message:

> **Store is locked by developer**
> Kindly contact at rohanxblu.in for updates.

## Files

| File | Purpose |
|---|---|
| `status.json` | The toggle. `"locked": true` = ON, `"locked": false` = OFF |
| `lock.js` | Script the theme loads. Reads `status.json` and shows the overlay if locked |
| `vercel.json` | CORS + no-cache headers so a toggle takes effect right away |
| `index.html` | Test page showing the current status |

## Toggle the lock

1. Open `status.json` on GitHub (the web editor works from a phone too).
2. Change `"locked"` to `true` (lock) or `false` (unlock).
3. Commit. Vercel redeploys automatically, usually in under a minute.

## Add to the Shopify theme

Put this in `layout/theme.liquid` just before `</body>`:

```html
<script src="https://YOUR-PROJECT.vercel.app/lock.js" defer></script>
```

## Behavior

- If `status.json` can't be reached (network error, Vercel down), the store stays **open**. A lock outage never takes the store down.
- The overlay uses Shadow DOM, so theme CSS can't break it. If it's removed from the page, it's added back.
- The title, message and contact link can be edited in `status.json` without touching `lock.js`.
