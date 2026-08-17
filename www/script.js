// ─── Navigation helpers ───────────────────────────────────────────────────────

function goToList(suitName) {
    window.location.href = `list.html?suit=${suitName}`;
}

function goToDetail(cardId, orientation, suit) {
    const s = suit || new URLSearchParams(window.location.search).get('suit');
    window.location.href = `detail.html?suit=${s}&id=${cardId}&orient=${orientation}`;
}

// ─── Page router ─────────────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop();

    if (page === "list.html") {
        loadListPage();
    } else if (page === "detail.html") {
        loadDetailPage();
    } else {
        // index / home
        renderHistory();
    }
});

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchCards(suit) {
    const response = await fetch(`cards/${suit}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

// ─── List Page ────────────────────────────────────────────────────────────────

async function loadListPage() {
    const params = new URLSearchParams(window.location.search);
    const suit = params.get('suit');
    document.getElementById('suit-title').textContent = capitalizeFirstLetter(suit);

    try {
        const cards = await fetchCards(suit);
        const container = document.getElementById('card-container');
        container.innerHTML = '';

        cards.forEach(card => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'card-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'card-name';
            nameSpan.textContent = card.name;
            nameSpan.onclick = () => goToDetail(card.id, 'upright');

            const revBtn = document.createElement('button');
            revBtn.className = 'reversed-btn';
            revBtn.textContent = 'Reversed';
            revBtn.onclick = () => goToDetail(card.id, 'reversed');

            itemDiv.appendChild(nameSpan);
            itemDiv.appendChild(revBtn);
            container.appendChild(itemDiv);
        });
    } catch (error) {
        console.error("Failed to load cards:", error);
        showError('list', `Could not load cards for "${suit}". Please check your connection and try again.`);
    }
}

// ─── Detail Page ─────────────────────────────────────────────────────────────

async function loadDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const suit = params.get('suit');
    const cardId = parseInt(params.get('id'));
    const orientation = params.get('orient');

    try {
        const cards = await fetchCards(suit);
        const card = cards.find(c => c.id === cardId);

        if (!card) throw new Error('Card not found');

        let titleText = card.name;
        if (orientation === 'reversed') {
            titleText = `${card.name} (reversed)`;
        }
        document.getElementById('card-title').textContent = titleText;

        if (card.image) {
            document.getElementById('card-image').textContent = card.image;
        }

        const badge = document.getElementById('orientation-badge');
        badge.textContent = orientation === 'reversed' ? '🔄 Reversed' : '⬆️ Upright';
        badge.className = `orientation-badge ${orientation}`;

        const textToShow = orientation === 'upright' ? card.upright : card.reversed;
        document.getElementById('description-box').textContent = textToShow;

        document.getElementById('card-display').style.display = 'block';

        // Save to history
        saveToHistory({ suit, id: cardId, orientation, name: card.name, image: card.image || '' });

    } catch (error) {
        console.error("Failed to load detail:", error);
        showError('detail', 'Could not load this card. Please go back and try again.');
    }
}

// ─── Random Card ─────────────────────────────────────────────────────────────

const ALL_SUITS = ['major', 'cups', 'wands', 'pentacles', 'swords'];
const ORIENTATIONS = ['upright', 'reversed'];

async function drawRandomCard() {
    const suit = ALL_SUITS[Math.floor(Math.random() * ALL_SUITS.length)];
    const orientation = ORIENTATIONS[Math.floor(Math.random() * 2)];

    try {
        const cards = await fetchCards(suit);
        const card = cards[Math.floor(Math.random() * cards.length)];
        goToDetail(card.id, orientation, suit);
    } catch (error) {
        console.error("Failed to draw random card:", error);
        alert('Could not draw a random card. Please try again.');
    }
}

// ─── Reading History ──────────────────────────────────────────────────────────

const HISTORY_KEY = 'tutu_history';
const HISTORY_MAX = 10;

function saveToHistory(entry) {
    let history = loadHistory();
    // Avoid duplicating the same card+orientation consecutively
    if (history.length && history[0].suit === entry.suit &&
        history[0].id === entry.id && history[0].orientation === entry.orientation) {
        return;
    }
    history.unshift(entry);
    if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}

function renderHistory() {
    const history = loadHistory();
    const section = document.getElementById('history-section');
    const list = document.getElementById('history-list');
    if (!section || !list) return;

    if (history.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    history.forEach(entry => {
        const row = document.createElement('div');
        row.className = 'history-item';
        row.onclick = () => goToDetail(entry.id, entry.orientation, entry.suit);

        const img = document.createElement('span');
        img.className = 'history-image';
        img.textContent = entry.image || '🃏';

        const info = document.createElement('span');
        info.className = 'history-info';
        info.textContent = `${entry.name} — ${capitalizeFirstLetter(entry.orientation)}`;

        row.appendChild(img);
        row.appendChild(info);
        list.appendChild(row);
    });
}

// ─── Error display ────────────────────────────────────────────────────────────

function showError(page, message) {
    const box = document.getElementById('error-box');
    const msg = document.getElementById('error-msg');
    if (box && msg) {
        msg.textContent = message;
        box.style.display = 'block';
    }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

