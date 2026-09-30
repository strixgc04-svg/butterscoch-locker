# Store Lock

A remote ON/OFF lock for a Shopify storefront. When it's on, the store is covered by a full-screen message:

> **Store is locked by developer**
> Kindly contact at rohanxblu.in for updates.

## Toggle the lock

Open **https://butterscoch-locker.vercel.app**, enter the password, and flip the switch.

The page commits the new value to `status.json` in this repo. Vercel redeploys and the change is live, usually in under a minute. The page shows when it's live.

Fallback: edit `status.json` on GitHub directly (`"locked": true` / `false`) and commit.

## Files

| File | Purpose |
|---|---|
| `status.json` | The lock state. `"locked": true` = ON, `"locked": false` = OFF |
| `lock.js` | Script the theme loads. Reads `status.json` and shows the overlay if locked |
| `index.html` | The ON/OFF toggle page |
| `api/toggle.js` | Checks the password and commits `status.json` to GitHub |
| `vercel.json` | CORS + no-cache headers so a toggle takes effect right away |

## Setup (Vercel environment variables)

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | Password for the toggle page |
| `GITHUB_TOKEN` | Fine-grained GitHub token, access to this repo only, permission **Contents: Read and write** |

Create the token at https://github.com/settings/personal-access-tokens/new, then add both in
Vercel → butterscoch-locker → Settings → Environment Variables (Production), and redeploy.

## Add to the Shopify theme

Put this in `layout/theme.liquid` just before `</body>`:

```html
<script src="https://butterscoch-locker.vercel.app/lock.js" defer></script>
```

## Behavior

- If `status.json` can't be reached (network error, Vercel down), the store stays **open**. A lock outage never takes the store down.
- The overlay uses Shadow DOM, so theme CSS can't break it. If it's removed from the page, it's added back.
- The title, message and contact link can be edited in `status.json` without touching `lock.js`.
- Toggle commits land in this repo, so run `git pull` before editing locally.
