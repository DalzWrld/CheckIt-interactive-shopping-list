/* ───────────────────────────────────────────────
   CheckIt — main.js
   All data lives in Flask/SQLite via the REST API
   ─────────────────────────────────────────────── */

const API = "http://127.0.0.1:5000";

// ── State ──────────────────────────────────────
let allLists    = [];   // [{id, name, budget, created_at}]
let activeListId = null;
let allItems    = [];   // items for the active list
let editingItemId = null;

// ── DOM refs ───────────────────────────────────
const listsNav       = document.getElementById("listsNav");
const welcomeState   = document.getElementById("welcomeState");
const listView       = document.getElementById("listView");
const listViewTitle  = document.getElementById("listViewTitle");
const budgetBar      = document.getElementById("budgetBar");
const budgetLabel    = document.getElementById("budgetLabel");
const budgetRemaining= document.getElementById("budgetRemaining");
const budgetFill     = document.getElementById("budgetFill");
const inputForm      = document.getElementById("inputForm");
const itemNameEl     = document.getElementById("itemName");
const itemQtyEl      = document.getElementById("itemQty");
const itemPriceEl    = document.getElementById("itemPrice");
const itemCategoryEl = document.getElementById("itemCategory");
const listEl         = document.getElementById("list");
const listCount      = document.getElementById("listCount");
const filterCategory = document.getElementById("filterCategory");
const clearBtn       = document.getElementById("clearButton");
const totalAmount    = document.getElementById("totalAmount");
const totalNote      = document.getElementById("totalNote");
const errorMsg       = document.getElementById("errorMsg");
const emptyState     = document.getElementById("emptyState");
const btnDeleteList  = document.getElementById("btnDeleteList");

// Modals
const newListModal   = document.getElementById("newListModal");
const newListName    = document.getElementById("newListName");
const newListBudget  = document.getElementById("newListBudget");
const newListCancel  = document.getElementById("newListCancel");
const newListSave    = document.getElementById("newListSave");

const editModal      = document.getElementById("editModal");
const editNameEl     = document.getElementById("editName");
const editQtyEl      = document.getElementById("editQty");
const editPriceEl    = document.getElementById("editPrice");
const editCategoryEl = document.getElementById("editCategory");
const editCancel     = document.getElementById("editCancel");
const editSave       = document.getElementById("editSave");

// Mobile
const btnMenu        = document.getElementById("btnMenu");
const btnNewList     = document.getElementById("btnNewList");
const btnWelcomeNew  = document.getElementById("btnWelcomeNew");
const sidebar        = document.getElementById("sidebar");

// ── Helpers ────────────────────────────────────
const fmt = (n) =>
    "KSh " + parseFloat(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function showError(msg) {
    errorMsg.textContent = msg;
    clearTimeout(showError._t);
    showError._t = setTimeout(() => { errorMsg.textContent = ""; }, 3500);
}

function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
}

// ── API calls ──────────────────────────────────
async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(`${API}${path}`, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong.");
        return data;
    } catch (err) {
        showError(err.message);
        throw err;
    }
}

// ── Load all lists ─────────────────────────────
async function loadLists() {
    allLists = await apiFetch("/lists/");
    renderSidebar();

    // If there's an active list still around, reload it
    if (activeListId && allLists.find(l => l.id === activeListId)) {
        await loadItems(activeListId);
    } else if (allLists.length > 0 && !activeListId) {
        // Auto-select first list
        await selectList(allLists[0].id);
    } else if (allLists.length === 0) {
        showWelcome();
    }
}

// ── Render sidebar ─────────────────────────────
function renderSidebar() {
    listsNav.innerHTML = "";
    allLists.forEach(lst => {
        const li = document.createElement("li");
        li.className = "list-nav-item" + (lst.id === activeListId ? " active" : "");
        li.dataset.id = lst.id;
        li.innerHTML = `
            <span class="list-nav-icon">🛒</span>
            <span class="list-nav-name">${escHtml(lst.name)}</span>
            <span class="list-nav-count">${lst.item_count ?? ""}</span>
        `;
        li.addEventListener("click", () => selectList(lst.id));
        listsNav.appendChild(li);
    });
}

// ── Select a list ──────────────────────────────
async function selectList(listId) {
    activeListId = listId;
    filterCategory.value = "all";

    // Update sidebar highlight
    document.querySelectorAll(".list-nav-item").forEach(el => {
        el.classList.toggle("active", Number(el.dataset.id) === listId);
    });

    // Close mobile sidebar
    sidebar.classList.remove("open");
    document.querySelector(".sidebar-overlay")?.remove();

    await loadItems(listId);
}

// ── Load items for active list ─────────────────
async function loadItems(listId) {
    const lst = allLists.find(l => l.id === listId);
    if (!lst) return;

    allItems = await apiFetch(`/lists/${listId}/items`);

    listViewTitle.textContent = lst.name;
    welcomeState.hidden = true;
    listView.hidden = false;

    // Budget
    if (lst.budget) {
        budgetBar.hidden = false;
        renderBudget(lst.budget);
    } else {
        budgetBar.hidden = true;
    }

    renderItems();
}

// ── Render budget bar ──────────────────────────
function renderBudget(budget) {
    const lst = allLists.find(l => l.id === activeListId);
    if (!lst || !budget) return;

    const spent = allItems.filter(i => !i.purchased).reduce((s, i) => s + i.subtotal, 0);
    const pct   = Math.min((spent / budget) * 100, 100);
    const remaining = budget - spent;

    budgetLabel.textContent = `Budget: ${fmt(budget)}`;

    if (remaining < 0) {
        budgetRemaining.textContent = `Over by ${fmt(Math.abs(remaining))}`;
        budgetRemaining.className = "over-budget";
        budgetFill.className = "budget-fill over";
    } else if (pct >= 80) {
        budgetRemaining.textContent = `${fmt(remaining)} left`;
        budgetRemaining.className = "near-budget";
        budgetFill.className = "budget-fill near";
    } else {
        budgetRemaining.textContent = `${fmt(remaining)} left`;
        budgetRemaining.className = "on-budget";
        budgetFill.className = "budget-fill";
    }

    budgetFill.style.width = pct + "%";
}

// ── Render items (grouped by category) ─────────
function renderItems() {
    listEl.innerHTML = "";

    const filter = filterCategory.value;
    const visible = filter === "all"
        ? allItems
        : allItems.filter(i => i.category === filter);

    const total     = allItems.length;
    const done      = allItems.filter(i => i.purchased).length;
    const unpaidSum = allItems.filter(i => !i.purchased).reduce((s, i) => s + i.subtotal, 0);

    listCount.textContent = total === 0
        ? "0 items"
        : `${total} item${total !== 1 ? "s" : ""} · ${done} checked`;

    totalAmount.textContent = fmt(unpaidSum);
    totalNote.textContent   = done > 0 ? "(purchased items excluded)" : "";

    emptyState.classList.toggle("visible", visible.length === 0);

    // Group by category
    const groups = {};
    visible.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });

    const categoryEmojis = {
        "Produce": "🥦", "Dairy": "🧀", "Bakery": "🍞",
        "Meat & Fish": "🥩", "Snacks": "🍿", "Drinks": "🥤",
        "Household": "🧹", "Uncategorised": "📦"
    };

    Object.keys(groups).forEach(cat => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "category-group";

        const heading = document.createElement("div");
        heading.className = "category-heading";
        heading.innerHTML = `<span>${categoryEmojis[cat] || "📦"}</span> ${escHtml(cat)}`;
        groupDiv.appendChild(heading);

        groups[cat].forEach(item => {
            const li = document.createElement("li");
            li.className = "item-card" + (item.purchased ? " purchased" : "");
            li.dataset.id = item.id;
            li.innerHTML = `
                <div class="item-check" role="checkbox" aria-checked="${item.purchased}" tabindex="0" aria-label="Mark ${escHtml(item.name)} as purchased"></div>
                <div class="item-info">
                    <div class="item-name">${escHtml(item.name)}</div>
                    <div class="item-meta">
                        <span class="item-price-tag">${fmt(item.price)}</span>
                        <span class="item-qty-tag">× ${item.quantity}</span>
                    </div>
                </div>
                <div class="item-subtotal">${fmt(item.subtotal)}</div>
                <div class="item-actions">
                    <button class="btn-action btn-edit" title="Edit" aria-label="Edit ${escHtml(item.name)}">✏️</button>
                    <button class="btn-action btn-delete" title="Delete" aria-label="Delete ${escHtml(item.name)}">🗑️</button>
                </div>
            `;

            // Toggle purchased
            const check = li.querySelector(".item-check");
            const toggle = () => togglePurchased(item.id, !item.purchased);
            check.addEventListener("click", toggle);
            check.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });

            li.querySelector(".btn-edit").addEventListener("click",   () => openEditModal(item.id));
            li.querySelector(".btn-delete").addEventListener("click", () => deleteItem(item.id, li));

            groupDiv.appendChild(li);
        });

        listEl.appendChild(groupDiv);
    });

    // Refresh budget bar
    const lst = allLists.find(l => l.id === activeListId);
    if (lst?.budget) renderBudget(lst.budget);
}

function showWelcome() {
    welcomeState.hidden = false;
    listView.hidden = true;
    activeListId = null;
}

// ── Add Item ───────────────────────────────────
inputForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name     = itemNameEl.value.trim();
    const price    = parseFloat(itemPriceEl.value);
    const quantity = parseInt(itemQtyEl.value) || 1;
    const category = itemCategoryEl.value;

    if (!name)                    return showError("Please enter an item name.");
    if (isNaN(price) || price < 0) return showError("Please enter a valid price.");
    if (!activeListId)             return showError("No list selected.");

    try {
        const newItem = await apiFetch(`/lists/${activeListId}/items`, {
            method: "POST",
            body: JSON.stringify({ name, price, quantity, category })
        });
        allItems.unshift(newItem);
        itemNameEl.value = ""; itemPriceEl.value = ""; itemQtyEl.value = "1";
        itemNameEl.focus();
        errorMsg.textContent = "";
        renderItems();
        updateSidebarCount();
    } catch (_) {}
});

// ── Toggle purchased ───────────────────────────
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

// ── Delete item ────────────────────────────────
async function deleteItem(itemId, cardEl) {
    cardEl.style.transition = "opacity 0.2s, transform 0.2s";
    cardEl.style.opacity    = "0";
    cardEl.style.transform  = "translateX(20px)";
    await new Promise(r => setTimeout(r, 200));

    try {
        await apiFetch(`/items/${itemId}`, { method: "DELETE" });
        allItems = allItems.filter(i => i.id !== itemId);
        renderItems();
        updateSidebarCount();
    } catch (_) {}
}

// ── Clear all items ────────────────────────────
clearBtn.addEventListener("click", async () => {
    if (!activeListId || allItems.length === 0) return;
    if (!confirm("Clear all items from this list?")) return;

    // Delete each item via API
    try {
        await Promise.all(allItems.map(i => apiFetch(`/items/${i.id}`, { method: "DELETE" })));
        allItems = [];
        renderItems();
        updateSidebarCount();
    } catch (_) {}
});

// ── Delete list ────────────────────────────────
btnDeleteList.addEventListener("click", async () => {
    const lst = allLists.find(l => l.id === activeListId);
    if (!lst) return;
    if (!confirm(`Delete the list "${lst.name}" and all its items?`)) return;

    try {
        await apiFetch(`/lists/${activeListId}`, { method: "DELETE" });
        activeListId = null;
        allItems = [];
        await loadLists();
    } catch (_) {}
});

// ── Filter by category ─────────────────────────
filterCategory.addEventListener("change", renderItems);

// ── Edit Item Modal ────────────────────────────
function openEditModal(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    editingItemId       = itemId;
    editNameEl.value    = item.name;
    editQtyEl.value     = item.quantity;
    editPriceEl.value   = item.price;
    editCategoryEl.value = item.category;
    openModal(editModal);
    editNameEl.focus();
}

editCancel.addEventListener("click", () => closeModal(editModal));

editSave.addEventListener("click", async () => {
    const name     = editNameEl.value.trim();
    const price    = parseFloat(editPriceEl.value);
    const quantity = parseInt(editQtyEl.value) || 1;
    const category = editCategoryEl.value;

    if (!name)                    return showError("Item name cannot be empty.");
    if (isNaN(price) || price < 0) return showError("Enter a valid price.");

    try {
        const updated = await apiFetch(`/items/${editingItemId}`, {
            method: "PATCH",
            body: JSON.stringify({ name, price, quantity, category })
        });
        const idx = allItems.findIndex(i => i.id === editingItemId);
        if (idx !== -1) allItems[idx] = updated;
        closeModal(editModal);
        renderItems();
    } catch (_) {}
});

// ── New List Modal ─────────────────────────────
[btnNewList, btnWelcomeNew].forEach(btn =>
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

    if (!name) return showError("Please enter a list name.");

    try {
        const newList = await apiFetch("/lists/", {
            method: "POST",
            body: JSON.stringify({ name, budget })
        });
        allLists.unshift(newList);
        closeModal(newListModal);
        await selectList(newList.id);
        renderSidebar();
    } catch (_) {}
});

// ── Mobile sidebar ─────────────────────────────
btnMenu.addEventListener("click", () => {
    sidebar.classList.add("open");
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay show";
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.remove();
    });
    document.body.appendChild(overlay);
});

// ── Sidebar count helper ───────────────────────
function updateSidebarCount() {
    const navItem = listsNav.querySelector(`[data-id="${activeListId}"] .list-nav-count`);
    if (navItem) navItem.textContent = allItems.length || "";
}

// ── Modal helpers ──────────────────────────────
function openModal(overlay) {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
}
function closeModal(overlay) {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
}

[newListModal, editModal].forEach(overlay => {
    overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(overlay); });
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(newListModal); closeModal(editModal); }
});

// ── Init ───────────────────────────────────────
loadLists();