/*
 * POST /api/toggle  { "password": "...", "locked": true | false }
 * Checks the admin password, then commits the new "locked" value to
 * status.json on GitHub. The commit triggers a Vercel redeploy.
 *
 * Env vars (set in Vercel project settings):
 *   ADMIN_PASSWORD  password for the toggle page
 *   GITHUB_TOKEN    fine-grained token with Contents: read & write on this repo
 *   GITHUB_REPO     optional, defaults to strixgc04-svg/butterscoch-locker
 *   GITHUB_BRANCH   optional, defaults to main
 */
const crypto = require("crypto");

function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    ADMIN_PASSWORD,
    GITHUB_TOKEN,
    GITHUB_REPO = "strixgc04-svg/butterscoch-locker",
    GITHUB_BRANCH = "main",
  } = process.env;

  if (!ADMIN_PASSWORD || !GITHUB_TOKEN) {
    return res.status(500).json({ error: "Server not configured: set ADMIN_PASSWORD and GITHUB_TOKEN" });
  }

  const { password, locked } = req.body || {};

  if (typeof password !== "string" || !safeEqual(password, ADMIN_PASSWORD)) {
    // Slow down password guessing.
    await new Promise((r) => setTimeout(r, 1000));
    return res.status(401).json({ error: "Wrong password" });
  }
  if (typeof locked !== "boolean") {
    return res.status(400).json({ error: '"locked" must be true or false' });
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/status.json`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "butterscoch-locker",
  };

  const current = await fetch(`${url}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers });
  if (!current.ok) {
    return res.status(502).json({ error: `GitHub read failed (${current.status})` });
  }
  const file = await current.json();
  const status = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));

  if (status.locked === locked) {
    return res.status(200).json({ locked, changed: false });
  }

  status.locked = locked;
  const update = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: locked ? "Lock store" : "Unlock store",
      content: Buffer.from(JSON.stringify(status, null, 2) + "\n").toString("base64"),
      sha: file.sha,
      branch: GITHUB_BRANCH,
    }),
  });
  if (!update.ok) {
    return res.status(502).json({ error: `GitHub write failed (${update.status})` });
  }

  return res.status(200).json({ locked, changed: true });
};
