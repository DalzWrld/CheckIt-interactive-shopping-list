/* ═══════════════════════════════════════════════════
   CheckIt — main.js
   Communicates with Flask REST API at localhost:5001
════════════════════════════════════════════════════ */

const API = "http://127.0.0.1:5001";  // Flask backend URL

// ── Category config ──────────────────────────────
const CAT = {
    "Produce":       { color: "#4caf50", emoji: "🥦" },
    "Dairy":         { color: "#2196f3", emoji: "🧀" },
    "Bakery":        { color: "#ff9800", emoji: "🍞" },
    "Meat & Fish":   { color: "#f44336", emoji: "🥩" },
    "Snacks":        { color: "#9c27b0", emoji: "🍿" },
    "Drinks":        { color: "#00bcd4", emoji: "🥤" },
    "Household":     { color: "#607d8b", emoji: "🧹" },
    "Uncategorised": { color: "#9e9e9e", emoji: "📦" },
};

// ── State ────────────────────────────────────────
let allLists      = [];
let activeListId  = null;
let allItems      = [];
let editingItemId = null;

// ── DOM refs ─────────────────────────────────────
// Layout
const sidebar         = document.getElementById("sidebar");
const sidebarOverlay  = document.getElementById("sidebarOverlay");
const listsNav        = document.getElementById("listsNav");
const summaryTotal    = document.getElementById("summaryTotal");
const summaryRemaining= document.getElementById("summaryRemaining");
const dashboard       = document.getElementById("dashboard");
const listView        = document.getElementById("listView");

// Dashboard
const listCardsGrid   = document.getElementById("listCardsGrid");
const dashboardEmpty  = document.getElementById("dashboardEmpty");
const statTotalLists  = document.getElementById("statTotalLists");
const statTotalItems  = document.getElementById("statTotalItems");
const statChecked     = document.getElementById("statChecked");
const statSpend       = document.getElementById("statSpend");

// List view
const listViewTitle   = document.getElementById("listViewTitle");
const listViewEyebrow = document.getElementById("listViewEyebrow");
const listStatsBadges = document.getElementById("listStatsBadges");
const budgetBar       = document.getElementById("budgetBar");
const budgetLabel     = document.getElementById("budgetLabel");
const budgetRemaining = document.getElementById("budgetRemaining");
const budgetFill      = document.getElementById("budgetFill");
const inputForm       = document.getElementById("inputForm");
const itemNameEl      = document.getElementById("itemName");
const itemQtyEl       = document.getElementById("itemQty");
const itemPriceEl     = document.getElementById("itemPrice");
const itemCategoryEl  = document.getElementById("itemCategory");
const itemAisleEl     = document.getElementById("itemAisle");
const itemNoteEl      = document.getElementById("itemNote");
const listEl          = document.getElementById("list");
const listCount       = document.getElementById("listCount");
const filterCategory  = document.getElementById("filterCategory");
const clearBtn        = document.getElementById("clearButton");
const emptyState      = document.getElementById("emptyState");
const spendBreakdown  = document.getElementById("spendBreakdown");
const breakdownBars   = document.getElementById("breakdownBars");
const totalAmount     = document.getElementById("totalAmount");
const totalNote       = document.getElementById("totalNote");
const errorMsg        = document.getElementById("errorMsg");

// Buttons
const btnMenu       = document.getElementById("btnMenu");
const btnNewList    = document.getElementById("btnNewList");
const btnHeroNew    = document.getElementById("btnHeroNew");
const btnEmptyNew   = document.getElementById("btnEmptyNew");
const btnBack       = document.getElementById("btnBack");
const btnDeleteList = document.getElementById("btnDeleteList");

// Modals
const newListModal  = document.getElementById("newListModal");
const newListName   = document.getElementById("newListName");
const newListBudget = document.getElementById("newListBudget");
const newListCancel = document.getElementById("newListCancel");
const newListSave   = document.getElementById("newListSave");

const editModal     = document.getElementById("editModal");
const editNameEl    = document.getElementById("editName");
const editQtyEl     = document.getElementById("editQty");
const editPriceEl   = document.getElementById("editPrice");
const editCatEl     = document.getElementById("editCategory");
const editAisleEl   = document.getElementById("editAisle");
const editNoteEl    = document.getElementById("editNote");
const editCancel    = document.getElementById("editCancel");
const editSave      = document.getElementById("editSave");

// ── Helpers ──────────────────────────────────────
const fmt = (n) =>
    "KSh " + parseFloat(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtShort = (n) =>
    "KSh " + parseFloat(n).toLocaleString("en-KE", { maximumFractionDigits: 0 });

function esc(str) {
    return String(str).replace(/[&<>"']/g, c =>
        ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])
    );
}

function showError(msg) {
    errorMsg.textContent = msg;
    clearTimeout(showError._t);
    showError._t = setTimeout(() => { errorMsg.textContent = ""; }, 3500);
}

function timeAgo(isoStr) {
    const diff = Date.now() - new Date(isoStr);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

// ── API ───────────────────────────────────────────
async function apiFetch(path, opts = {}) {
    try {
        const res = await fetch(`${API}${path}`, {
            headers: { "Content-Type": "application/json" },
            ...opts,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong.");
        return data;
    } catch (err) {
        showError(err.message);
        throw err;
    }
}

// ── Load everything ───────────────────────────────
async function loadLists() {
    allLists = await apiFetch("/lists/");
    renderSidebar();
    renderDashboard();
}

// ── Sidebar ───────────────────────────────────────
function renderSidebar() {
    listsNav.innerHTML = "";

    // Overall summary
    const allItemsFlatPromises = allLists.map(l => apiFetch(`/lists/${l.id}/items`));
    Promise.all(allItemsFlatPromises).then(results => {
        const flat = results.flat();
        const pending = flat.filter(i => !i.purchased);
        const total   = pending.reduce((s, i) => s + i.subtotal, 0);
        summaryTotal.textContent     = fmtShort(total);
        summaryRemaining.textContent = pending.length;
    });

    allLists.forEach(lst => {
        const li = document.createElement("li");
        li.className = "list-nav-item" + (lst.id === activeListId ? " active" : "");
        li.dataset.id = lst.id;

        li.innerHTML = `
            <div class="nav-item-top">
                <span class="nav-item-name">${esc(lst.name)}</span>
                <span class="nav-item-count">${lst.item_count ?? "–"}</span>
            </div>
            <div class="nav-item-meta">
                <span>${timeAgo(lst.created_at)}</span>
                <span>${lst.budget ? fmtShort(lst.budget) + " budget" : "No budget"}</span>
            </div>
            ${lst.budget ? `
            <div class="nav-budget-bar">
                <div class="nav-budget-fill" style="width: 0%" data-list-id="${lst.id}"></div>
            </div>` : ""}
        `;
        li.addEventListener("click", () => openListView(lst.id));
        listsNav.appendChild(li);
    });
}

// ── Dashboard ─────────────────────────────────────
function renderDashboard() {
    listView.hidden  = true;
    dashboard.hidden = false;
    activeListId     = null;

    document.querySelectorAll(".list-nav-item").forEach(el => el.classList.remove("active"));

    statTotalLists.textContent = allLists.length;

    if (allLists.length === 0) {
        dashboardEmpty.hidden = false;
        listCardsGrid.innerHTML = "";
        statTotalItems.textContent = 0;
        statChecked.textContent    = 0;
        statSpend.textContent      = "KSh 0";
        return;
    }

    dashboardEmpty.hidden = true;

    // Fetch items for all lists to build dashboard cards
    Promise.all(allLists.map(l => apiFetch(`/lists/${l.id}/items`))).then(results => {
        listCardsGrid.innerHTML = "";

        let totalItems = 0, totalChecked = 0, totalSpend = 0;

        allLists.forEach((lst, idx) => {
            const items     = results[idx];
            const purchased = items.filter(i => i.purchased).length;
            const remaining = items.filter(i => !i.purchased).length;
            const spend     = items.filter(i => !i.purchased).reduce((s, i) => s + i.subtotal, 0);
            const pct       = items.length > 0 ? Math.round((purchased / items.length) * 100) : 0;

            totalItems   += items.length;
            totalChecked += purchased;
            totalSpend   += spend;

            // Update nav budget fill
            if (lst.budget) {
                const fill = listsNav.querySelector(`[data-list-id="${lst.id}"]`);
                if (fill) {
                    const budgetPct = Math.min((spend / lst.budget) * 100, 100);
                    fill.style.width = budgetPct + "%";
                    fill.className = "nav-budget-fill" +
                        (budgetPct >= 100 ? " over" : budgetPct >= 80 ? " near" : "");
                }
            }

            const card = document.createElement("div");
            card.className = "list-card";
            card.innerHTML = `
                <div class="list-card-top">
                    <div class="list-card-icon">🛒</div>
                    <div style="flex:1">
                        <div class="list-card-name">${esc(lst.name)}</div>
                    </div>
                    <div class="list-card-date">${timeAgo(lst.created_at)}</div>
                </div>
                <div class="list-card-stats">
                    <div class="card-stat">
                        <div class="card-stat-value">${items.length}</div>
                        <div class="card-stat-label">Items</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-value">${purchased}</div>
                        <div class="card-stat-label">Checked</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-value" style="color:var(--green-dark)">${fmtShort(spend)}</div>
                        <div class="card-stat-label">Remaining</div>
                    </div>
                </div>
                <div class="list-card-progress">
                    <div class="progress-info">
                        <span>${purchased} of ${items.length} items checked off</span>
                        <span>${pct}%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
                ${lst.budget ? `
                <div class="list-card-budget">
                    <div>
                        <div class="budget-used">${fmt(spend)}</div>
                        <div class="budget-cap">of ${fmt(lst.budget)} budget</div>
                    </div>
                    <span class="budget-pill ${spend > lst.budget ? "over" : spend / lst.budget >= 0.8 ? "near" : ""}">
                        ${spend > lst.budget ? "Over budget" : spend / lst.budget >= 0.8 ? "Almost full" : "On track"}
                    </span>
                </div>` : ""}
            `;
            card.addEventListener("click", () => openListView(lst.id));
            listCardsGrid.appendChild(card);
        });

        statTotalItems.textContent = totalItems;
        statChecked.textContent    = totalChecked;
        statSpend.textContent      = fmtShort(totalSpend);
    });
}

// ── Open list view ────────────────────────────────
async function openListView(listId) {
    activeListId = listId;
    filterCategory.value = "all";

    document.querySelectorAll(".list-nav-item").forEach(el => {
        el.classList.toggle("active", Number(el.dataset.id) === listId);
    });

    closeSidebar();

    allItems = await apiFetch(`/lists/${listId}/items`);

    dashboard.hidden = true;
    listView.hidden  = false;

    const lst = allLists.find(l => l.id === listId);
    listViewTitle.textContent   = lst.name;
    listViewEyebrow.textContent = lst.budget
        ? `Budget: ${fmt(lst.budget)}`
        : "Shopping List";

    if (lst.budget) {
        budgetBar.hidden = false;
        renderBudget(lst.budget);
    } else {
        budgetBar.hidden = true;
    }

    renderItems();
}

// ── Budget bar ────────────────────────────────────
function renderBudget(budget) {
    const spent     = allItems.filter(i => !i.purchased).reduce((s, i) => s + i.subtotal, 0);
    const pct       = Math.min((spent / budget) * 100, 100);
    const remaining = budget - spent;

    budgetLabel.textContent = `Budget: ${fmt(budget)}`;

    if (remaining < 0) {
        budgetRemaining.textContent = `Over by ${fmt(Math.abs(remaining))}`;
        budgetRemaining.className   = "over-budget";
        budgetFill.className        = "budget-fill over";
    } else if (pct >= 80) {
        budgetRemaining.textContent = `${fmt(remaining)} left`;
        budgetRemaining.className   = "near-budget";
        budgetFill.className        = "budget-fill near";
    } else {
        budgetRemaining.textContent = `${fmt(remaining)} left`;
        budgetRemaining.className   = "on-budget";
        budgetFill.className        = "budget-fill";
    }
    budgetFill.style.width = pct + "%";
}

// ── Render items ──────────────────────────────────
function renderItems() {
    listEl.innerHTML = "";

    const filter  = filterCategory.value;
    const visible = filter === "all" ? allItems : allItems.filter(i => i.category === filter);

    const total      = allItems.length;
    const done       = allItems.filter(i => i.purchased).length;
    const unpaidSum  = allItems.filter(i => !i.purchased).reduce((s, i) => s + i.subtotal, 0);

    // Count badge
    listCount.textContent = total === 0
        ? "0 items"
        : `${total} item${total !== 1 ? "s" : ""} · ${done} checked`;

    // Stats badges
    listStatsBadges.innerHTML = `
        <span class="stats-badge">${total} item${total !== 1 ? "s" : ""}</span>
        <span class="stats-badge green">${done} checked off</span>
        <span class="stats-badge">${fmt(unpaidSum)} remaining</span>
    `;

    totalAmount.textContent = fmt(unpaidSum);
    totalNote.textContent   = done > 0 ? "(purchased items excluded)" : "";

    emptyState.hidden = visible.length > 0;

    // Group by category
    const groups = {};
    visible.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });

    Object.keys(groups).forEach(cat => {
        const catConf  = CAT[cat] || CAT["Uncategorised"];
        const groupDiv = document.createElement("div");
        groupDiv.className = "cat-group";

        groupDiv.innerHTML = `
            <div class="cat-heading" style="--cat-color: ${catConf.color}">
                <span>${catConf.emoji}</span> ${esc(cat)}
                <span style="margin-left:auto;font-weight:400;opacity:0.6">${groups[cat].length} item${groups[cat].length !== 1 ? "s" : ""}</span>
            </div>
        `;

        groups[cat].forEach(item => {
            const li = document.createElement("li");
            li.className = "item-card" + (item.purchased ? " purchased" : "");
            li.dataset.id = item.id;

            const hasExtras = item.note || item.aisle;

            li.innerHTML = `
                <div class="item-cat-strip" style="background: ${catConf.color}"></div>
                <div class="item-card-inner">
                    <div class="item-check" role="checkbox" aria-checked="${item.purchased}" tabindex="0">
                        ${item.purchased ? "✓" : ""}
                    </div>
                    <div class="item-info">
                        <div class="item-name">${esc(item.name)}</div>
                        <div class="item-tags">
                            <span class="item-tag">× ${item.quantity}</span>
                            <span class="item-tag" style="color: var(--green-price); background: var(--green-light)">${fmt(item.price)} each</span>
                        </div>
                        ${hasExtras ? `
                        <div class="item-extras">
                            <div class="item-extra-row">
                                ${item.aisle ? `<span class="item-extra"><span class="item-extra-icon">📍</span> ${esc(item.aisle)}</span>` : ""}
                                ${item.note  ? `<span class="item-extra"><span class="item-extra-icon">📝</span> ${esc(item.note)}</span>` : ""}
                            </div>
                        </div>` : ""}
                    </div>
                    <div class="item-right">
                        <div class="item-subtotal">${fmt(item.subtotal)}</div>
                        <div class="item-unit-price">${fmt(item.price)} × ${item.quantity}</div>
                        <div class="item-actions">
                            <button class="btn-act edit" title="Edit" aria-label="Edit ${esc(item.name)}">✏️</button>
                            <button class="btn-act del"  title="Delete" aria-label="Delete ${esc(item.name)}">🗑️</button>
                        </div>
                    </div>
                </div>
            `;

            const check  = li.querySelector(".item-check");
            const toggle = () => togglePurchased(item.id, !item.purchased);
            check.addEventListener("click", toggle);
            check.addEventListener("keydown", e => {
                if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); }
            });

            li.querySelector(".btn-act.edit").addEventListener("click", () => openEditModal(item.id));
            li.querySelector(".btn-act.del").addEventListener("click",  () => deleteItem(item.id, li));

            groupDiv.appendChild(li);
        });

        listEl.appendChild(groupDiv);
    });

    // Budget
    const lst = allLists.find(l => l.id === activeListId);
    if (lst?.budget) renderBudget(lst.budget);

    // Spend breakdown
    renderBreakdown();
}

// ── Spend breakdown ───────────────────────────────
function renderBreakdown() {
    const unpaid = allItems.filter(i => !i.purchased);
    if (unpaid.length === 0) { spendBreakdown.hidden = true; return; }

    const byCategory = {};
    unpaid.forEach(i => {
        byCategory[i.category] = (byCategory[i.category] || 0) + i.subtotal;
    });

    const maxVal = Math.max(...Object.values(byCategory));
    spendBreakdown.hidden = false;
    breakdownBars.innerHTML = "";

    Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, total]) => {
            const catConf = CAT[cat] || CAT["Uncategorised"];
            const pct     = (total / maxVal) * 100;
            const row     = document.createElement("div");
            row.className = "breakdown-row";
            row.innerHTML = `
                <div class="breakdown-label">
                    <span>${catConf.emoji}</span>
                    <span>${esc(cat)}</span>
                </div>
                <div class="breakdown-bar-wrap">
                    <div class="breakdown-bar-fill" style="width: ${pct}%; background: ${catConf.color}"></div>
                </div>
                <div class="breakdown-amount">${fmt(total)}</div>
            `;
            breakdownBars.appendChild(row);
        });
}

// ── Add item ──────────────────────────────────────
inputForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name     = itemNameEl.value.trim();
    const price    = parseFloat(itemPriceEl.value);
    const quantity = parseInt(itemQtyEl.value)  || 1;
    const category = itemCategoryEl.value;
    const aisle    = itemAisleEl.value.trim();
    const note     = itemNoteEl.value.trim();

    if (!name)                    return showError("Please enter an item name.");
    if (isNaN(price) || price < 0) return showError("Please enter a valid price.");
    if (!activeListId)             return showError("No list selected.");

    try {
        const newItem = await apiFetch(`/lists/${activeListId}/items`, {
            method: "POST",
            body: JSON.stringify({ name, price, quantity, category, aisle, note })
        });
        allItems.unshift(newItem);
        itemNameEl.value = ""; itemPriceEl.value = "";
        itemQtyEl.value  = "1"; itemAisleEl.value = ""; itemNoteEl.value = "";
        itemNameEl.focus();
        errorMsg.textContent = "";
        renderItems();
    } catch (_) {}
});

// ── Toggle purchased ──────────────────────────────
async function togglePurchased(itemId, purchased) {
    try {
        const updated = await apiFetch(`/items/${itemId}`, {
            method: "PATCH",
            body: JSON.stringify({ purchased })
        });
        const idx = allItems.findIndex(i => i.id === itemId);
        if (idx !== -1) allItems[idx] = updated;
        renderItems();
    } catch (_) {}
}

// ── Delete item ───────────────────────────────────
async function deleteItem(itemId, cardEl) {
    cardEl.style.transition = "opacity 0.2s, transform 0.2s";
    cardEl.style.opacity    = "0";
    cardEl.style.transform  = "translateX(20px)";
    await new Promise(r => setTimeout(r, 200));
    try {
        await apiFetch(`/items/${itemId}`, { method: "DELETE" });
        allItems = allItems.filter(i => i.id !== itemId);
        renderItems();
    } catch (_) {}
}

// ── Clear all ─────────────────────────────────────
clearBtn.addEventListener("click", async () => {
    if (!activeListId || allItems.length === 0) return;
    if (!confirm("Clear all items from this list?")) return;
    try {
        await Promise.all(allItems.map(i => apiFetch(`/items/${i.id}`, { method: "DELETE" })));
        allItems = [];
        renderItems();
    } catch (_) {}
});

// ── Delete list ───────────────────────────────────
btnDeleteList.addEventListener("click", async () => {
    const lst = allLists.find(l => l.id === activeListId);
    if (!lst) return;
    if (!confirm(`Delete "${lst.name}" and all its items?`)) return;
    try {
        await apiFetch(`/lists/${activeListId}`, { method: "DELETE" });
        allLists = allLists.filter(l => l.id !== activeListId);
        activeListId = null;
        allItems     = [];
        renderSidebar();
        renderDashboard();
    } catch (_) {}
});

// ── Back to dashboard ─────────────────────────────
btnBack.addEventListener("click", () => {
    activeListId = null;
    listView.hidden  = true;
    dashboard.hidden = false;
    document.querySelectorAll(".list-nav-item").forEach(el => el.classList.remove("active"));
    renderDashboard();
});

// ── Filter ────────────────────────────────────────
filterCategory.addEventListener("change", renderItems);

// ── Edit modal ────────────────────────────────────
function openEditModal(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    editingItemId       = itemId;
    editNameEl.value    = item.name;
    editQtyEl.value     = item.quantity;
    editPriceEl.value   = item.price;
    editCatEl.value     = item.category;
    editAisleEl.value   = item.aisle || "";
    editNoteEl.value    = item.note  || "";
    openModal(editModal);
    editNameEl.focus();
}

editCancel.addEventListener("click", () => closeModal(editModal));

editSave.addEventListener("click", async () => {
    const name     = editNameEl.value.trim();
    const price    = parseFloat(editPriceEl.value);
    const quantity = parseInt(editQtyEl.value) || 1;
    const category = editCatEl.value;
    const aisle    = editAisleEl.value.trim();
    const note     = editNoteEl.value.trim();

    if (!name)                     return showError("Item name cannot be empty.");
    if (isNaN(price) || price < 0) return showError("Enter a valid price.");

    try {
        const updated = await apiFetch(`/items/${editingItemId}`, {
            method: "PATCH",
            body: JSON.stringify({ name, price, quantity, category, aisle, note })
        });
        const idx = allItems.findIndex(i => i.id === editingItemId);
        if (idx !== -1) allItems[idx] = updated;
        closeModal(editModal);
        renderItems();
    } catch (_) {}
});

// ── New list modal ────────────────────────────────
[btnNewList, btnHeroNew, btnEmptyNew].forEach(btn =>
    btn.addEventListener("click", () => {
        newListName.value = ""; newListBudget.value = "";
        openModal(newListModal);
        newListName.focus();
    })
);

newListCancel.addEventListener("click", () => closeModal(newListModal));

newListSave.addEventListener("click", async () => {
    const name   = newListName.value.trim();
    const budget = parseFloat(newListBudget.value) || null;

    if (!name) {
        newListName.style.borderColor = "#ef4444";
        newListName.focus();
        return;
    }

    newListName.style.borderColor = "";
    newListSave.textContent = "Creating…";
    newListSave.disabled    = true;

    try {
        const newList = await apiFetch("/lists/", {
            method: "POST",
            body: JSON.stringify({ name, budget })
        });
        allLists.unshift(newList);
        closeModal(newListModal);
        renderSidebar();
        await openListView(newList.id);
    } catch (err) {
        newListSave.textContent = "Create List";
        newListSave.disabled    = false;
    }

    newListSave.textContent = "Create List";
    newListSave.disabled    = false;
});

// ── Mobile sidebar ────────────────────────────────
btnMenu.addEventListener("click", () => {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");
});

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
}

sidebarOverlay.addEventListener("click", closeSidebar);

// ── Modal helpers ─────────────────────────────────
function openModal(el)  { el.classList.add("open");    el.setAttribute("aria-hidden", "false"); }
function closeModal(el) { el.classList.remove("open"); el.setAttribute("aria-hidden", "true");  }

[newListModal, editModal].forEach(overlay => {
    overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(overlay); });
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(newListModal); closeModal(editModal); }
});

// ── Init ──────────────────────────────────────────
loadLists();