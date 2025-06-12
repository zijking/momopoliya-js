import Player from './pleyer.js';
import map from './map.js';


//прив'язка до елементів DOM кидок кубика
document.getElementById('roll').addEventListener('click', () => {
    handleTurn();
});

// Ініціалізація гравців
const players = [
    new Player('Гравець 1', '🧍‍♂️'),
    new Player('Гравець 2', '🧍‍♀️'),
    new Player('Гравець 3', '🧍‍♀️'),
    new Player('Гравець 4', '🧍‍♀️')
];

let currentPlayerIndex = 0;

// отримання поточного гравця
function getCurrentPlayer() {
    return players[currentPlayerIndex];
}


// Функція для переходу до наступного ходу
function nextTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updatePlayer();

}

function updateUI() {
    const info = players.map(p =>
        `<br/>${p.emoji} ${p.name}: $${p.balance} | Власність: ${p.properties.map(prop => prop.name).join('; ') || 'немає'}`).join();

    document.getElementById('status').innerHTML  += info;
}

//Функція відображення та оновлення гравців на полі
function updatePlayer() {
    // Видалити всі токени гравців з поля
    document.querySelectorAll(".player-token").forEach(el => el.remove());

    // Додати токени гравців у відповідні клітинки згідно їх позицій
    players.forEach((p, idx) => {
        const cell = document.querySelector(`.cell[data-index='${p.position}']`);
        if (cell) {
            if (!p.tokenElement) {
                const token = document.createElement('div');
                token.className = 'player-token';
                token.textContent = '';
                token.dataset.playerIndex = idx;
                const colors = ['green', 'yellow', 'red', 'blue'];
                token.style.width = '15px';
                token.style.height = '15px';
                token.style.borderRadius = '50%';
                token.style.backgroundColor = colors[idx % colors.length];
                token.style.display = 'inline-block';
                p.tokenElement = token;
            }
            cell.appendChild(p.tokenElement);
        }
    });
}


// Функція для обробки ходу гравця
function handleTurn(roll) {
    if (typeof roll !== 'number') {
        roll = Math.floor(Math.random() * 12) + 1;// Генеруємо випадковий кидок від 1 до 12
    }
    const player = getCurrentPlayer();// Отримуємо поточного гравця
    player.move(roll);// Переміщуємо гравця на нову позицію

    // Отримуємо нову позицію на полі   
    // const plot = document.querySelector(`.cell[data-index='${player.position}']`); // Знаходимо клітинку за позицією гравця
    const plot = getPlot(player.position); // Отримуємо об'єкт поля за позицією
    console.log("currentPlot: ", plot);

    const plotName = getPlotName(player.position); // Отримуємо назву поля
    
    document.getElementById('status').textContent =
        `${player.name} кинув ${roll} і потрапив на ${plotName}`;

    // Перевірка чи можна купити
    if (plot.owner === "bank") {
        if (confirm(`${plot.name} доступне за $${plot.cost}. Купити?`)) {
            if (player.balance >= plot.cost) {
                player.updateBalance(-plot.cost);
                player.addProperty(plot);
                plot.owner = player.name;
            } else {
                alert("Недостатньо коштів!");
            }
        }
    }

    console.log("Current player: ", player);
    console.log("MAP: ", map.getAllPlots());
    // Оновлюємо інтерфейс

    updatePlayer();
    nextTurn();
}

// Функція для отримання назви поля за позицією
const getPlotName = (position) => {
    const plots = map.getAllPlots();
    const plot = plots.find(p => p.position === position);
    return plot ? plot.name : 'Невідоме поле';        
}

// Функція для отримання об'єкта поля за позицією
const getPlot = (position) => {
    const plots = map.getAllPlots();
    return plots.find(p => p.position === position);
}

export const player = {
    startPosition: () => {
        // const players = document.createElement("div");
        const startCell = document.querySelector(`.cell[data-index='${0}']`);
        players.forEach((p, idx) => {
            const token = document.createElement('div');
            token.className = 'player-token';
            token.textContent = '';
            token.dataset.playerIndex = idx;
            const colors = ['green', 'yellow', 'red', 'blue'];
            token.style.width = '15px';
            token.style.height = '15px';
            token.style.borderRadius = '50%';
            token.style.backgroundColor = colors[idx % colors.length];
            token.style.display = 'inline-block';
            p.tokenElement = token;
            startCell.appendChild(token);
            p.position = 0;
        });
        const player = getCurrentPlayer();
        player.position = 0; // Початкова позиція
        document.getElementById('status').textContent = `${player.name} починає гру!`;
        updateUI();
    },    


};

