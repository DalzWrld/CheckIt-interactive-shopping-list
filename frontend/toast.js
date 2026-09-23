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
})();