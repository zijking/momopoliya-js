import Player from "./pleyer.js";
import map from "./map.js";
import { showModal, showModalWithChoices } from './modal.js';


//прив'язка до елементів DOM кидок кубика
document.getElementById("roll").addEventListener("click", () => {
  handleTurn();
});

// Ініціалізація гравців
const players = [
  new Player("Гравець 1", "🚗"),
  new Player("Гравець 2", "✈️"),
  new Player("Гравець 3", "🎈"),
  new Player("Гравець 4", "🚢"),
];

let currentPlayerIndex = 0;

// отримання поточного гравця
function getCurrentPlayer() {
  return players[currentPlayerIndex];
}

// Функція для переходу до наступного ходу
function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
 }

// Функція для оновлення інформації про гравців
function updateUI() {
  const info = players
    .map(
      (p) =>
        `<br/>${p.emoji} ${p.name}: $${p.balance} | Власність: ${
          p.properties.map((prop) => prop.name).join("; ") || "немає"
        }`
    )
    .join();

  document.getElementById("status").innerHTML = info;
}

//Функція відображення та оновлення гравців на полі
function updatePlayer() {
  // Видалити всі токени гравців з поля
  document.querySelectorAll(".player-token").forEach((el) => el.remove());

  // Додати токени гравців у відповідні клітинки згідно їх позицій
  players.forEach((p, idx) => {
    const cell = document.querySelector(`.cell[data-index='${p.position}']`);
    if (cell) {
      if (!p.tokenElement) {

        const token = createToken(p, idx);

        p.tokenElement = token;
      }
      cell.appendChild(p.tokenElement);
    }
  });
}

// Функція для створення токена гравця
/**
 * Creates a player token DOM element with specific styles and emoji.
 *
 * @param {Object} player - The player object containing player data.
 * @param {string} player.emoji - The emoji representing the player.
 * @param {number} idx - The index of the player (used for color selection and data attributes).
 * @returns {HTMLDivElement} The created player token element.
 */
const createToken = (player, idx) => {
  const token = document.createElement("div");
  token.className = "player-token";
  token.textContent = '';
  token.dataset.playerIndex = idx;        
  const colors = ["green", "yellow", "red", "blue"];        
  token.style.width = "25px";
  token.style.height = "25px";
  token.style.borderRadius = "50%";
  token.style.borderBottom = `2px solid ${colors[idx % colors.length]}`;
  token.innerHTML = player.emoji; // Додаємо емодзі гравця
  // token.style.backgroundColor = colors[idx % colors.length];        
  token.style.display = "inline-block";
  
  return token;
}

// Функція для обробки ходу гравця
function handleTurn(roll) {
  if (typeof roll !== "number") {
    roll = Math.floor(Math.random() * 12) + 1; // Генеруємо випадковий кидок від 1 до 12
  }
  const player = getCurrentPlayer(); // Отримуємо поточного гравця
  player.move(roll); // Переміщуємо гравця на нову позицію

  // Отримуємо нову позицію на полі
  const plot = getPlot(player.position); // Отримуємо об'єкт поля за позицією
  console.log("currentPlot: ", plot);

  const plotName = getPlotName(player.position); // Отримуємо назву поля

  // document.getElementById('status').textContent =
  //     `${player.name} кинув ${roll} і потрапив на ${plotName}`;
  showModal(
    `${player.emoji} ${player.name} кинув 🎲 ${roll}<br>Переходить на: <strong>${plotName}</strong>`,
    () => {
      // Перевірка чи можна купити
      if (plot.owner === "bank") {
        showModalWithChoices(
          `${plot.name} доступне за $${plot.cost}. Купити?`,
          [
            {
              label: '✅ Купити',
              onClick: () => {
                if (player.balance >= plot.cost) {
                  player.updateBalance(-plot.cost);
                  player.addProperty(plot);
                  plot.owner = player.name;
                  highlightOwnedProperties();
                  updatePlayer();
                  updateUI();
                  nextTurn();
                } else {
                  showModalWithChoices("❌ Недостатньо коштів!", [
                    { label: 'OK', onClick: () => nextTurn() }
                  ]);
                }
              }
            },
            {
              label: '❌ Відмовитись',
                onClick: () => { nextTurn(); updatePlayer(); updateUI();}
            }
          ]
        );
      } else {
          // інша логіка
            updatePlayer();
            updateUI();
            nextTurn();
      }
      

      console.log("Current player: ", player);
      console.log("MAP: ", map.getAllPlots());
      // Оновлюємо інтерфейс

    //   updatePlayer();
    //   updateUI();
    //   nextTurn();
    }
  );
}

// Функція для отримання назви поля за позицією
const getPlotName = (position) => {
  const plots = map.getAllPlots();
  const plot = plots.find((p) => p.position === position);
  return plot ? plot.name : "Невідоме поле";
};

// Функція для отримання об'єкта поля за позицією
const getPlot = (position) => {
  const plots = map.getAllPlots();
  return plots.find((p) => p.position === position);
};

function highlightOwnedProperties() {
  // Скидаємо попередні позначення
  document.querySelectorAll(".cell").forEach((cell) => {
    for (let i = 0; i < players.length; i++) {
      cell.classList.remove(`owned-by-${i}`);
    }
  });

  players.forEach((player, idx) => {
    player.properties.forEach((prop) => {
      const cell = document.querySelector(
        `.cell[data-index='${prop.position}']`
      );
      if (cell) {
        cell.classList.add(`owned-by-${idx}`);
      }
    });
  });
}

export const player = {
  startPosition: () => {
    // const players = document.createElement("div");
    const startCell = document.querySelector(`.cell[data-index='${0}']`);
    players.forEach((p, idx) => {

      const token = createToken(p, idx);
      
      p.tokenElement = token;
      startCell.appendChild(token);
      p.position = 0;
    });
    const player = getCurrentPlayer();
    player.position = 0; // Початкова позиція
    document.getElementById(
      "status"
    ).textContent = `${player.name} починає гру!`;
    updateUI();
  },
};
