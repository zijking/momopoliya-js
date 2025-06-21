import Player from "./pleyer.js";
import map from "./map.js";
import { showModal, showModalWithChoices } from "./modal.js";
import actionPlayer from "./playerActions.js";
import playerActions from "./playerActions.js";
import { logAction } from "./utils.js";
import { handleCardDraw } from "./cardEventsOld.js";
import { emojiSet } from "./emojiSet.js";

//прив'язка до елементів DOM кидок кубика
document.getElementById("roll").addEventListener("click", () => {
  handleTurn();
});

const jailPosition = 10; // Позиція в'язниці

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
  const player = getCurrentPlayer(); // Отримуємо поточного гравця
  const { die1, die2, sum, isDouble } = rollDice(); // Кидаємо кубики

  // 🧱 Перевірка в'язниці
  if (player.inJail) {
    const result = handleJail(player);
    if (!result.freed) {
      // nextTurn();
      return; // не виходить — просто передає хід
    }
    // Якщо вийшов — продовжуємо далі як звичайний хід
    logAction(
      `${player.emoji} ${player.name} вийшов з в'язниці і продовжує гру 🎉`
    );
  }
  //-----

  //Блок для тестування кидка кубика
  // const die1 = 1;
  // const die2 = 1; // Для тестування, встановлюємо фіксовані значення кубиків
  // const isDouble = die1 === die2; // Перевіряємо, чи це
  // const sum = die1 + die2; // Сума кидка кубика
  //-----------------

  logAction(
    `${player.emoji} ${player.name} кинув 🎲 ${die1} i ${die2} ${
      isDouble ? "(Дубль)" : ""
    }`
  );

  roll = sum; // Використовуємо суму кидка кубика

  const newPosition = (player.position + roll) % 40; // Обчислюємо нову позицію з урахуванням кількості полів на полі

  player.lastRoll = roll; // Зберігаємо останній кидок кубика

  logAction(
    `${player.emoji}  кинув кубики 🎲: <b>${roll}</b> (з ${
      getPlot(player.position).name
    } на ${getPlot(newPosition).name})`
  ); // лог дії кидка кубика

  if (isDouble) {
    player.doublesCount = (player.doublesCount || 0) + 1;
    if (player.doublesCount === 3) {
      player.position = jailPosition; // тюрма
      player.inJail = true;
      logAction(
        `${player.emoji} ${player.name} кинув дубль 3 рази підряд і потрапляє у в'язницю ${emojiSet.jail.alarm}`
      );
      updatePlayer();
      updateUI();
      nextTurn();
      return;
    }
  } else {
    player.doublesCount = 0; // скинути лічильник, якщо не дубль
  }

  playerActions.salaryCheck(player, roll); // Перевіряємо зарплату гравця

  player.move(roll); // Переміщуємо гравця на нову позицію

  const plot = getPlot(player.position); // Отримуємо об'єкт поля за позицією
  const plotName = getPlotName(player.position); // Отримуємо назву поля

  showModal(
    `${player.emoji} ${player.name} кинув 🎲 <b>${die1} i ${die2}</b><br>Переходить на: <strong>${plotName}</strong>`,
    () => hundelByPlotOrPayrent(plot, player, roll, isDouble)
  );

  console.log("Current player: ", player);
  console.log("MAP: ", map.getAllPlots());

  // Оновлюємо інтерфейс
  updatePlayer();
  updateUI();
  // nextTurn(); // Передаємо хід наступному гравцеві
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

// Функція для кидка двох кубиків
// Повертає об'єкт з результатами кидка
const rollDice = () => {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return { die1, die2, sum: die1 + die2, isDouble: die1 === die2 };
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
const showModalForByPlot = (player, plot, onComplete) => {
  showModalWithChoices(`${plot.name} доступне за $${plot.cost}. Купити?`, [
    {
      label: "✅ Купити",
      onClick: () => {
        if (player.balance >= plot.cost) {
          actionPlayer.buyPlot(player, plot);
          highlightOwnedProperties();
          logAction(
            `${player.emoji} ${player.name} купив ${plot.name} за $${plot.cost}`
          );
          updateUI();
          onComplete(); // ⬅️ завершуємо хід
        } else {
          showModalWithChoices("❌ Недостатньо коштів!", [
            {
              label: "OK",
              onClick: () => {
                updateUI();
                onComplete(); // ⬅️ завершуємо хід навіть після помилки
              },
            },
          ]);
        }
      },
    },
    {
      label: "❌ Відмовитись",
      onClick: () => {
        logAction(
          `${player.emoji} ${player.name} відмовився купувати ${plot.name}`
        );
        updateUI();
        onComplete(); // ⬅️ завершуємо хід
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
const hundelByPlotOrPayrent = (plot, player, roll, isDouble) => {
  console.log("HundelByPlotOrPayrent: ", plot, player, roll, isDouble);

  // Купівля у банку
  if (plot.owner === "bank") {
    showModalForByPlot(player, plot, () => {
      if (isDouble && player.doublesCount < 3 && !player.inJail) {
        logAction(
          `${player.emoji} ${player.name} отримує додатковий хід за дубль 🎲`
        );
        handleTurn();
      } else {
        player.doublesCount = 0;
        logAction(
          `${player.emoji} ${player.name} передає хід наступному гравцеві`
        );
        nextTurn();
      }
    });
    return;
  }

  // Поле Паркінг
  if (plot.type === "parking") {
    const sum = plot.cost || 0;
    if (sum > 0) {
      player.updateBalance(sum);
      plot.amount = 0;
      logAction(
        `${player.emoji} ${player.name} отримує $${sum} винагороди з паркінгу`
      );
    } else {
      logAction(`${player.emoji} ${player.name} потрапив на порожній Паркінг`);
    }
    updateParkingDisplay();
    updateUI();
    return finishTurn(player, isDouble);
  }

  // Податок
  if (plot.type === "tax") {
    if (chekTax(plot, player)) {
      logAction(
        `${player.emoji} ${player.name} сплачує податок ${
          plot.name
        } у розмірі $${Math.abs(plot.cost || 0)}`
      );
    } else {
      alert(`${player.name} не зміг сплатити податок — недостатньо коштів!`);
    }
    updateUI();
    return finishTurn(player, isDouble);
  }

  // Шанс або Бюджет
  if (plot.type === "chance" || plot.type === "budget") {
    // console.log("plot.type: CHANCE OR BUDGET: ", plot.type);
    handleCardDraw(plot.type, player, () => finishTurn(player, isDouble));
    // handleCardDraw(plot.type, player);
    // return finishTurn(player, isDouble);
  }

  // Оренда іншому гравцеві
  if (plot.owner && plot.owner !== player.name && plot.owner !== "city") {
    const success = actionPlayer.payRentToOwner(player, plot, players);
    if (!success) {
      alert(`${player.name} не зміг сплатити оренду — недостатньо коштів!`);
    }
    updateUI();
    return finishTurn(player, isDouble);
  }

  /* ⚖️  Поле «Суд» — одразу у в'язницю */
  if (plot.type === "court") {
    player.position = jailPosition; // позиція клітинки «В'язниця»
    player.inJail = true;
    player.jailTurns = 0;
    player.doublesCount = 0;

    logAction(
      `${player.emoji} ${player.name} потрапляє на ⚖️ Суд і відправляється у 🧱 В'язницю`
    );
    updatePlayer();
    updateUI();
    return finishTurn(player, isDouble);
  }

  // Якщо поле не обробилось
  console.log(
    `row: [467]${player.name} не зміг обробити дію — невідоме поле [else 003]`
  );
  return finishTurn(player, isDouble);
};

// Функція для завершення ходу гравця
function finishTurn(player, isDouble) {
  if (isDouble && player.doublesCount < 3 && !player.inJail) {
    logAction(`${player.emoji} ${player.name} отримує ще один хід 🎲`);
    handleTurn();
  } else {
    player.doublesCount = 0;
    logAction(`${player.emoji} ${player.name} передає хід наступному гравцю`);
    nextTurn();
  }
}

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

// Функція для обробки в'язниці
function handleJail(player) {
  player.jailTurns++;

  logAction(
    `${player.emoji} ${player.name} у в'язниці (хід ${player.jailTurns} з 3)`
  );

  const { die1, die2, sum, isDouble } = rollDice();
  logAction(`${player.emoji} кидає кубики у в'язниці: 🎲 ${die1} і ${die2}`);

  if (isDouble) {
    logAction(
      `${player.emoji} ${player.name} викидає дубль і виходить з в'язниці!`
    );
    player.inJail = false;
    player.jailTurns = 0;
    player.move(sum);
    return { freed: true, roll: sum, isDouble: true };
  }

  if (player.jailTurns >= 3) {
    logAction(
      `${player.emoji} ${player.name} відсидів 3 ходи і виходить з в'язниці`
    );
    player.inJail = false;
    player.jailTurns = 0;
    player.updateBalance(-50); // штраф
    player.move(sum);
    return { freed: true, roll: sum, isDouble: false };
  }

  // ще сидить
  logAction(
    `${player.emoji} ${player.name} передає хід наступному гравцеві, залишаючись у в'язниці`
  );
  nextTurn();
  return { freed: false };
}


// playerMove.js — модуль для переміщення гравця на стартову позицію
export const playerMain = {
  startPosition,
  updateUI,
  updatePlayer,
};
