const cardCache = {};

async function loadList(suit) {
    if (!cardCache[suit]) {
        const response = await fetch(`cards/${suit}.json`);
        cardCache[suit] = await response.json();
    }
    const cards = cardCache[suit];

    const container = document.getElementById('card-container');
    container.innerHTML = '';

    cards.forEach(card => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'card-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'card-name';
        nameSpan.textContent = card.name;
        nameSpan.onclick = () => loadDetail(suit, card.id, 'upright');

        const revBtn = document.createElement('button');
        revBtn.className = 'reversed-btn';
        revBtn.textContent = 'Reversed';
        revBtn.onclick = () => loadDetail(suit, card.id, 'reversed');

        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(revBtn);
        container.appendChild(itemDiv);
    });

    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
    window.scrollTo(0, 0);
}

function loadDetail(suit, cardId, orientation) {
    const cards = cardCache[suit];
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const titleText = orientation === 'reversed' ? `${card.name} (reversed)` : card.name;
    document.getElementById('card-title').textContent = titleText;
    document.getElementById('description-box').textContent =
        orientation === 'upright' ? card.upright : card.reversed;

    document.getElementById('list-view').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';
    window.scrollTo(0, 0);
}
