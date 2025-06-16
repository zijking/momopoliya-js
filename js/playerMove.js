import Player from "./pleyer.js";
import map from "./map.js";
import { showModal, showModalWithChoices } from "./modal.js";
import actionPlayer from "./playerActions.js";
import playerActions from "./playerActions.js";

//прив'язка до елементів DOM кидок кубика
document.getElementById("roll").addEventListener("click", () => {
  handleTurn();
});

const randomPlayers = [
  { name: "Астронавт", emoji: "👨‍🚀" },
  { name: "Інопланетянин", emoji: "👽" },
  { name: "Робот", emoji: "🤖" },
  { name: "Зоряний Капітан", emoji: "🧑‍✈️" },
  { name: "Космічний Пес", emoji: "🐕‍🦺" },
  { name: "Марсіянин", emoji: "🛸" },
  { name: "Галактичний Кіт", emoji: "🐱" },
  { name: "Супутник", emoji: "🛰️" }
];

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
  const status = document.getElementById("status");
  status.innerHTML = ""; // Очищаємо

  players.forEach((p) => {
    const wrapper = document.createElement("div");
    wrapper.className = "player-info";

    // Основна частина — емоджі, ім'я, баланс
    wrapper.innerHTML = `
          <div class="player-summary">
              <span class="emoji">${p.emoji}</span>
              <span class="name">${p.name}</span>
              <span class="balance">💰 ${p.balance}</span>
          </div>
      `;

    // Додатковий блок з власністю (при наведенні)
    const propBlock = document.createElement("div");
    propBlock.className = "player-properties";

    if (p.properties.length > 0) {
      propBlock.innerHTML = p.properties
        .map((prop) => `• ${prop.name} (${prop.cost}$)`)
        .join("<br/>");
    } else {
      propBlock.textContent = "немає власності";
    }

    wrapper.appendChild(propBlock);
    status.appendChild(wrapper);
  });
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

      const overlay = cell.querySelector(".token-overlay");
      if (overlay && !overlay.contains(p.tokenElement)) {
        overlay.appendChild(p.tokenElement);
      }

    }
  });
}

// Функція для створення токена гравця
const createToken = (player, idx) => {
  const token = document.createElement("div");
  token.className = "player-token";
  token.textContent = "";
  token.dataset.playerIndex = idx;
  const colors = ["green", "yellow", "red", "blue"];
  token.style.width = "25px";
  token.style.height = "25px";
  token.style.borderRadius = "50%";
  token.style.border = `3px solid ${colors[idx % colors.length]}`;
  token.innerHTML = player.emoji; // Додаємо емодзі гравця
  token.style.display = "inline-block";

  return token;
};

// Функція для обробки ходу гравця
function handleTurn(
  roll = null // Параметр для кидка кубика, якщо не передано, генеруємо випадковий кидок
)  {
  // console.log("roll: ", roll);
  if (typeof roll !== "number") {
    roll = Math.floor(Math.random() * 12) + 1; // Генеруємо випадковий кидок від 1 до 12
    if(roll === 1) {
      roll = 2; // Якщо випало 1, то вважаємо це 2
    }
  }
  const player = getCurrentPlayer(); // Отримуємо поточного гравця 
  playerActions.salaryCheck(player, roll); // Перевіряємо зарплату гравця

  player.move(roll); // Переміщуємо гравця на нову позицію

  const plot = getPlot(player.position); // Отримуємо об'єкт поля за позицією
  // console.log("currentPlot: ", plot);

  const plotName = getPlotName(player.position); // Отримуємо назву поля

  showModal(
    `${player.emoji} ${player.name} кинув 🎲 ${roll}<br>Переходить на: <strong>${plotName}</strong>`,
    () => {
      // Перевірка чи можна купити
      if (plot.owner === "bank") {
        showModalForByPlot(player, plot); // Викликаємо функцію для показу модального вікна з можливістю купівлі ділянки
      } else if (plot.owner !== player.name) {  // Якщо поле зайняте іншим гравцем, сплачуємо оренду
          // console.log("Pey rent: ", plot.rent);       
        if (plot.owner !== 'bank' && plot.owner !== player.name) {
          const success = actionPlayer.payRentToOwner(player, plot, players);
          if (success) {
            alert(`${player.name} сплатив оренду $${plot.rent} гравцю ${plot.owner}`);
            updateUI(); // Оновлюємо інтерфейс гравців
          } else {
            alert(`${player.name} не зміг сплатити оренду — недостатньо коштів!`);
          }
        }
      }      
      else {
        // інша логіка
      }   
    }
  );
   // console.log("Current player: ", player);
      console.log("MAP: ", map.getAllPlots());
   // Оновлюємо інтерфейс
        updatePlayer();
        updateUI();
        nextTurn();
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

// Функція для підсвічування полів у власності гравців
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

// Функція для показу модального вікна з можливістю купівлі ділянки
const showModalForByPlot = (player, plot) => { 
  showModalWithChoices(
    `${plot.name} доступне за $${plot.cost}. Купити?`,
    [
      {
        label: "✅ Купити",
        onClick: () => {
          if (player.balance >= plot.cost) {                 
            actionPlayer.buyPlot(player, plot); // Використовуємо функцію купівлі ділянки
            highlightOwnedProperties();  
            updateUI(); // Оновлюємо інтерфейс
          } else {
            showModalWithChoices("❌ Недостатньо коштів!", [
              { label: "OK", onClick: () => nextTurn() },
            ]);
            updateUI();
          }
        },
      },
      {
        label: "❌ Відмовитись",
        onClick: () => {      
        },
      },
    ]
  );

}



// playerMove.js — модуль для переміщення гравця на стартову позицію
export const player = {
  // Функція для переміщення гравця на стартову позицію
  startPosition: () => {
    // Ініціалізуємо гравців на стартовій позиції
    const startCell = document.querySelector(`.cell[data-index='${0}']`);
    players.forEach((p, idx) => {
      const token = createToken(p, idx);

      p.tokenElement = token;
      startCell.querySelector('.token-overlay').appendChild(token);
      p.position = 0;
    });
    const player = getCurrentPlayer();
    player.position = 0; // Початкова позиція
    document.getElementById("status" ).textContent = `${player.name} починає гру!`;
    updateUI();
  },
};
