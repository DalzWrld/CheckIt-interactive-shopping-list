/* ═══════════════════════════════════════════════════
   CheckIt — toast.js
   Lightweight toast notification system
   Usage:
     toast.success("List created!")
     toast.error("Something went wrong.")
     toast.warning("You're approaching your budget.")
     toast.info("3 items remaining.")
     toast.confirm("Delete this list?", onConfirm, onCancel)
════════════════════════════════════════════════════ */
 
const toast = (() => {
 
    // ── Create the container once ──────────────────
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
 
    // ── Config ─────────────────────────────────────
    const DURATION  = 3500;   // ms before auto-dismiss
    const ICONS = {
        success: "✓",
        error:   "✕",
        warning: "⚠",
        info:    "ℹ",
    };

     // ── Core show function ─────────────────────────
    function show(message, type = "info", duration = DURATION) {
        const el = document.createElement("div");
        el.className = `toast toast--${type}`;
        el.setAttribute("role", "alert");
        el.setAttribute("aria-live", "polite");
 
        el.innerHTML = `
            <span class="toast-icon">${ICONS[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Dismiss">✕</button>
        `;
 
        // Dismiss on close button
        el.querySelector(".toast-close").addEventListener("click", () => dismiss(el));
 
        container.appendChild(el);
 
        // Trigger enter animation on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add("toast--visible"));
        });

        // Auto-dismiss
        const timer = setTimeout(() => dismiss(el), duration);
 
        // Pause timer on hover
        el.addEventListener("mouseenter", () => clearTimeout(timer));
        el.addEventListener("mouseleave", () => {
            setTimeout(() => dismiss(el), 1200);
        });
 
        return el;

        function dismiss(el) {
        if (!el || el.classList.contains("toast--leaving")) return;
        el.classList.remove("toast--visible");
        el.classList.add("toast--leaving");
        el.addEventListener("transitionend", () => el.remove(), { once: true });
    }
    }
})();