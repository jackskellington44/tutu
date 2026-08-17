// Function to go from Main Page to List Page
function goToList(suitName) {
    window.location.href = `list.html?suit=${suitName}`;
}

// Run this when the page loads
window.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    
    if (currentPage === "list.html") {
        loadListPage();
    } else if (currentPage === "detail.html") {
        loadDetailPage();
    }
});

// Logic for the List Page
async function loadListPage() {
    const params = new URLSearchParams(window.location.search);
    const suit = params.get('suit');
    
    document.getElementById('suit-title').textContent = capitalizeFirstLetter(suit);

    try {
        const response = await fetch(`cards/${suit}.json`);
        const cards = await response.json();
        
        const container = document.getElementById('card-container');
        container.innerHTML = '';

        cards.forEach(card => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'card-item';
            
            // Clickable card name (opens Upright)
            const nameSpan = document.createElement('span');
            nameSpan.className = 'card-name';
            nameSpan.textContent = card.name;
            nameSpan.onclick = () => goToDetail(card.id, 'upright');
            
            // Reversed button
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
    }
}

// Function to go from List Page to Detail Page
function goToDetail(cardId, orientation) {
    const params = new URLSearchParams(window.location.search);
    const suit = params.get('suit');
    window.location.href = `detail.html?suit=${suit}&id=${cardId}&orient=${orientation}`;
}

// Logic for the Detail Page
async function loadDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const suit = params.get('suit');
    const cardId = parseInt(params.get('id'));
    const orientation = params.get('orient');

    try {
        const response = await fetch(`cards/${suit}.json`);
        const cards = await response.json();
        
        const card = cards.find(c => c.id === cardId);
        
        if (card) {
            // Combine title and orientation: "The Devil (reversed)" or just "The Devil"
            let titleText = card.name;
            if (orientation === 'reversed') {
                titleText = `${card.name} (reversed)`;
            }
            document.getElementById('card-title').textContent = titleText;
            
            // Show the correct description
            const textToShow = orientation === 'upright' ? card.upright : card.reversed;
            document.getElementById('description-box').textContent = textToShow;
        }
    } catch (error) {
        console.error("Failed to load detail:", error);
    }
}

// Helper to make "wands" look like "Wands"
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
