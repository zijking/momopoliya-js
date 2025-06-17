import Player from "./pleyer.js";
import map from "./map.js";
import { showModal, showModalWithChoices } from "./modal.js";
import actionPlayer from "./playerActions.js";
import playerActions from "./playerActions.js";
import { logAction } from "./utils.js";

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
  { name: "Супутник", emoji: "🛰️" },
];

// Ініціалізація гравців
const players = [
  new Player("Гравець 1", "🚗"),
  new Player("Гравець 2", "✈️"),
  new Player("Гравець 3", "🎈"),
  new Player("Гравець 4", "🚢"),
];

let currentPlayerIndex = 0;
let indexRoll = 0; // Індекс для кидка кубика для Тестування

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
function handleTurn(roll = 0) {
  roll = getroll(); // Отримуємо кидок кубика

  // roll = 4; // Для тестування, встановлюємо фіксований кидок кубика

  const player = getCurrentPlayer(); // Отримуємо поточного гравця
  const newPosition = (player.position + roll) % 40; // Обчислюємо нову позицію з урахуванням кількості полів на полі

  player.lastRoll = roll; // Зберігаємо останній кидок кубика

  logAction(
    `${player.emoji}  кинув кубики 🎲: <b>${roll}</b> (з ${
      getPlot(player.position).name
    } на ${getPlot(newPosition).name})`
  ); // лог дії кидка кубика

  playerActions.salaryCheck(player, roll); // Перевіряємо зарплату гравця

  player.move(roll); // Переміщуємо гравця на нову позицію

  const plot = getPlot(player.position); // Отримуємо об'єкт поля за позицією
  const plotName = getPlotName(player.position); // Отримуємо назву поля

  //----БЛОК ДЛЯ ТЕСТУ--------------------------
  // if(indexRoll === 0) {
  // //  getPlot(13).owner = players[0].name; // Для тестування, встановлюємо власника поля 13
  // getPlot(27).owner = players[0].name; // Для тестування, встановлюємо власника поля 27
  // // players[0].properties.push(getPlot(13)); // Додаємо поле 13 до власності гравця 1
  // players[0].properties.push(getPlot(27)); // Додаємо поле 27 до власності гравця 1
  //   // console.log("currentPlot: ", plot);
  //   indexRoll++
  // }

  //-----------------------------
  showModal(
    `${player.emoji} ${player.name} кинув 🎲 <b>${roll}</b><br>Переходить на: <strong>${plotName}</strong>`,
    () => hundelByPlotOrPaurent(plot, player, roll)
  );
  console.log("Current player: ", player);
  console.log("MAP: ", map.getAllPlots());

  // Оновлюємо інтерфейс
  updatePlayer();
  updateUI();
  nextTurn();
}

// Функція для отримання випадкового кидка кубика
const getroll = () => {
  // console.log("roll: ", roll);
  let roll = 0;
  roll = Math.floor(Math.random() * 12) + 1; // Генеруємо випадковий кидок від 1 до 12
  if (roll === 1) {
    roll = 2; // Якщо випало 1, то вважаємо це 2
  }
  return roll;
};

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
  console.log("showModalForByPlot: ");
  showModalWithChoices(`${plot.name} доступне за $${plot.cost}. Купити?`, [
    {
      label: "✅ Купити",
      onClick: () => {
        if (player.balance >= plot.cost) {
          actionPlayer.buyPlot(player, plot); // Використовуємо функцію купівлі ділянки
          highlightOwnedProperties();
          logAction(
            `${player.emoji} ${player.name} купив ${plot.name} за $${plot.cost}`
          );
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
        // console.log("Player refused to buy: ", plot.name);
        logAction(
          `${player.emoji} ${player.name} відмовився купувати ${plot.name}`
        );
        updateUI();
      },
    },
  ]);
};

// Функція для переміщення гравця на стартову позицію
const startPosition = () => {
  const player = getCurrentPlayer();
  logAction(
    "Гравці розташовуються на стартову позицію." +
      `<br>Гру починає ${player.emoji} ${player.name}`
  ); // лог дії
  // Ініціалізуємо гравців на стартовій позиції
  const startCell = document.querySelector(`.cell[data-index='${0}']`);
  players.forEach((p, idx) => {
    const token = createToken(p, idx);

    p.tokenElement = token;
    startCell.querySelector(".token-overlay").appendChild(token);
    p.position = 0;
  });

  player.position = 0; // Початкова позиція
  // document.getElementById("status" ).textContent = `${player.name} починає гру!`;
  console.log("MAP: ", map.getAllPlots());
  updateUI();
};

// Функція для обробки логіки покупки земельної ділянки або сплати оренди
const hundelByPlotOrPaurent = (plot, player, roll) => {
  // console.log("hundelMove: ");

  // Перевірка чи можна купити
  if (plot.owner === "bank") {
    showModalForByPlot(player, plot); // Викликаємо функцію для показу модального вікна з можливістю купівлі ділянки
    return;
  }

  // Якщо поле зайняте іншим гравцем, сплачуємо оренду
  // console.log("Pey rent: ", plot.rent);
  if (plot.owner && plot.owner !== player.name) {
    const success = actionPlayer.payRentToOwner(player, plot, players); // сплачуємо оренду власнику ділянки
    if (success) {
      updateUI(); // Оновлюємо інтерфейс гравців
      return;
    }
  }

  // Поле "Паркінг"
  if (plot.type === "parking") {
    // Якщо гравець знаходиться на полі "Паркінг", отримує винагороду
    const costParking = plot.cost || 0;
    if (costParking > 0) {
      player.updateBalance(costParking); // Додаємо кошти на баланс гравця
      logAction(
        `${player.emoji} ${player.name} отримує $${costParking} винагороди з паркінгу`
      ); // лог дії
      plot.cost = 0; // Скидаємо вартість паркінгу
      updateParkingDisplay(); // Оновлюємо відображення паркінгу
      updateUI(); // Оновлюємо інтерфейс гравців
    } else {
      logAction(`${player.emoji} ${player.name} потрапив на порожній Паркінг`);
      return; // Якщо паркінг порожній, нічого не робимо
    }
  }
  // Податок
  if (plot.type === "tax") {
    if (chekTax(plot, player)) {
      logAction(
        `${player.emoji} ${player.name} сплачує податок ${
          plot.name
        } у розмірі $${Math.abs(plot.cost || 0)}`
      );
      updateUI(); // Оновлюємо інтерфейс гравців
      return;
    } else {
      alert(
        `${player.name} не зміг сплатити оренду — недостатньо коштів! [001]`
      );
      return;
    }
  }

  alert(
    `${player.name} не зміг сплатити оренду — недостатньо коштів! [else 003]`
  );
};

// Функція для перевірки сплати податку
const chekTax = (plot, player) => {
  if (plot.type === "tax") {
    const taxAmount = Math.abs(plot.cost || 0);
    const success = player.pay(taxAmount); // сплачує банку

    if (success) {
      addToParking(taxAmount); // Додаємо кошти на парковку
      updateParkingDisplay();
      return true; // Повертаємо true, якщо податок сплачено
    } else {
      alert(
        `${player.name} не може сплатити податок у $${taxAmount} — недостатньо коштів!`
      );
      logAction(`${player.name} не зміг сплатити податок ${plot.name}`);
      return false; // Повертаємо false, якщо податок не сплачено
    }
  }
};

// Функція для додавання коштів на парковку
const addToParking = (amount) => {
  const plots = map.getAllPlots();
  const parking = plots.find((p) => p.type === "parking");
  if (parking) {
    parking.cost = (parking.cost || 0) + amount;
  }
};

// Функція для оновлення відображення паркінгу
const updateParkingDisplay = () => {
  const plots = map.getAllPlots();
  const parking = plots.find((p) => p.type === "parking");
  if (!parking) return;

  const cell = document.querySelector(
    `.cell[data-index="${parking.position}"]`
  );
  const display = cell?.querySelector(".parking-amount");
  if (display) {
    display.textContent = `$${parking.cost || 0}`;
  }
};

// playerMove.js — модуль для переміщення гравця на стартову позицію
export const player = {
  startPosition,
};
