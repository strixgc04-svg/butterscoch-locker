/*
 * Store Lock
 * Reads status.json from the same host this script is served from.
 * If "locked" is true, covers the storefront with a full-screen message.
 * If the status can't be fetched, the store stays open (fails open).
 */
(function () {
  var script = document.currentScript;
  if (!script || !script.src) return;

  var base = script.src.replace(/[^/]*(\?.*)?$/, "");
  var OVERLAY_ID = "dev-store-lock";

  fetch(base + "status.json?t=" + Date.now(), { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(function (status) {
      if (status && status.locked === true) lock(status);
    })
    .catch(function () {});

  function lock(status) {
    var title = status.title || "Store is locked by developer";
    var message = status.message || "Kindly contact at rohanxblu.in for updates.";
    var contactUrl = status.contact_url || "https://rohanxblu.in";
    var contactLabel = status.contact_label || "rohanxblu.in";

    function build() {
      var host = document.createElement("div");
      host.id = OVERLAY_ID;
      host.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;display:block;";

      // Shadow DOM keeps theme CSS from leaking into the overlay.
      var root = host.attachShadow({ mode: "closed" });
      root.innerHTML =
        "<style>" +
        ":host{all:initial}*{box-sizing:border-box}" +
        ".wrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
        "padding:24px;background:rgba(10,10,12,.96);backdrop-filter:blur(6px);" +
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}" +
        ".card{max-width:440px;width:100%;text-align:center;color:#f4f4f5;background:#18181b;" +
        "border:1px solid #27272a;border-radius:16px;padding:40px 28px;box-shadow:0 20px 60px rgba(0,0,0,.5);}" +
        ".icon{width:56px;height:56px;margin:0 auto 20px;border-radius:50%;background:#27272a;" +
        "display:flex;align-items:center;justify-content:center;}" +
        "h1{margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:600;}" +
        "p{margin:0 0 24px;font-size:15px;line-height:1.6;color:#a1a1aa;}" +
        "a{display:inline-block;padding:12px 22px;border-radius:10px;background:#f4f4f5;color:#18181b;" +
        "text-decoration:none;font-weight:600;font-size:14px;}" +
        "a:hover{background:#fff;}" +
        "</style>" +
        '<div class="wrap" role="alertdialog" aria-modal="true" aria-labelledby="t">' +
        '<div class="card">' +
        '<div class="icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f4f4f5" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>' +
        '<h1 id="t"></h1><p></p><a target="_blank" rel="noopener"></a>' +
        "</div></div>";

      // Set text via textContent so status.json can't inject markup.
      root.querySelector("h1").textContent = title;
      root.querySelector("p").textContent = message;
      var link = root.querySelector("a");
      link.textContent = contactLabel;
      link.href = contactUrl;

      return host;
    }

    function mount() {
      if (!document.getElementById(OVERLAY_ID)) {
        document.body.appendChild(build());
      }
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
    }

    function start() {
      mount();
      // Put the overlay back if something removes it.
      new MutationObserver(function () {
        if (!document.getElementById(OVERLAY_ID)) mount();
      }).observe(document.body, { childList: true });
    }

    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
  }
})();
