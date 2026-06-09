import { playerMain } from "./playerMove.js";
import map from "./map.js";

const confirmBtn = document.getElementById("trade-confirm-btn");
const overlay = document.getElementById("trade-modal-overlay");

let selectedOpponent = null; // Змінна для збереження вибраного опонента по торгівлі

// Імпортуємо функції для роботи з інтерфейсом торгівлі
export function tradeUI(players) {
  const tradeBtn = document.getElementById("open-trade-btn"); // 🔹 Кнопка для відкриття ринкової модалки
  const selectElement = document.getElementById("trade-target-player-select"); // Селект для вибору гравця, з яким хочемо торгувати

  initTradeModal(); // Ініціалізуємо модалку при завантаженні сторінки

  if (tradeBtn) {
    tradeBtn.addEventListener("click", () => onTradeButtonClick(players)); // Додаємо обробник кліку для відкриття ринкової модалки
  }

  selectElement.addEventListener("change", (event) =>
    selectOponentForTrade(event),
  ); // Додаємо обробник зміни селекту для вибору гравця, з яким хочемо торгувати
}

// Функція обробника кліку на кнопку відкриття ринкової модалки
export function onTradeButtonClick(players) {
  console.log(
    "Відкриваємо ринкову модалку для гравця:",
    playerMain.getCurrentPlayer(),
  ); // Виводимо в консоль ім'я гравця, для якого відкривається модалка

  const currentPlayerNameElem = document.getElementById("trade-player"); // Елемент для відображення імені поточного гравця в заголовку модалки

  if (currentPlayerNameElem) {
    currentPlayerNameElem.innerText = `${playerMain.getCurrentPlayer().emoji} ${playerMain.getCurrentPlayer().name}`; // Встановлюємо ім'я поточного гравця в заголовок модалки
  }
  setupSelectOptions(players); // Заповнюємо селект з гравцями для вибору партнера по торгівлі
  setPlayerProperties(); // Відображаємо властивості поточного гравця в модалці
  openTradeModal(); // Відкриваємо модалку торгівлі
}

// Функція для заповнення селекту з гравцями, з якими можна торгувати
export function setupSelectOptions(players) {
  const listPleyers = document.getElementById("trade-target-player-select"); // Селект для вибору гравця, з яким хочемо торгувати

  listPleyers.innerHTML = `<option value="" disabled selected>Оберіть гравця...</option>`; // Очищаємо попередні опції та додаємо першу опцію з підказкою

  players.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent =
      player.name === playerMain.getCurrentPlayer().name
        ? `${player.emoji} ${player.name} (ви)`
        : `${player.emoji} ${player.name}`;
    listPleyers.appendChild(option);
  });
}

// Функція обробника зміни селекту для вибору гравця, з яким хочемо торгувати
export const selectOponentForTrade = (event) => {
  const selectedPlayerId = event.target.value; // Обробка вибору гравця для торгівлі
  const seletedPlayerAria = document.getElementById("trade-request-properties"); // Елемент для відображення нерухомості гравця, з яким хочемо торгувати
  seletedPlayerAria.innerHTML = ""; // Очищаємо попередній список властивостей

  const selectedPlayer = playerMain.getPlayerById(selectedPlayerId); // Отримуємо об'єкт вибраного гравця за його ID
  selectedOpponent = selectedPlayer; // Зберігаємо вибраного опонента для подальшого використання при підтвердженні угоди

  console.log("Вибраний гравець для торгівлі:", selectedPlayer); // Виводимо в консоль інформацію про вибраного гравця

  if (seletedPlayerAria) {
    if (selectedPlayer.properties.length > 0) {
      // Проходимо по кожному об'єкту нерухомості гравця
      selectedPlayer.properties.forEach((property) => {
        // Створюємо елемент-обгортку для елемента списку
        const propertyItem = createPlayerPropertyItem(selectedPlayer, property);
        // Додаємо елемент у DOM-контейнер
        seletedPlayerAria.appendChild(propertyItem);
      });

      confirmBtn.disabled = false; // Активуємо кнопку підтвердження угоди, якщо у вибраного гравця є нерухомість для обміну
    }
  }
};

// Ініціалізація ринкової модалки та додавання обробників подій для закриття
export function initTradeModal() {
  const closeBtn = document.getElementById("trade-close-icon");
  const cancelBtn = document.getElementById("trade-cancel-btn");

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  confirmBtn.addEventListener("click", () => {
    confirmTrade(playerMain.getCurrentPlayer(), selectedOpponent);
  }); // Додаємо обробник для кнопки підтвердження угоди (поки що просто закриває модалку, логіку обміну додамо пізніше)

  // Закриття при кліку на темний фон (поза вікном)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
}

// Функція для закриття модалки
function closeModal() {
  overlay.classList.add("trade-hidden");
  // Тут потім будемо скидати всі чекбокси та поля вводу
}

// Функція для відображення властивостей поточного гравця в модалці
function setPlayerProperties() {
  const currentPlayer = playerMain.getCurrentPlayer(); // отримуємо поточного гравця

  const currentPlayerPropertiesElem = document.getElementById(
    "trade-offer-properties",
  ); // Елемент для відображення властивостей поточного гравця

  if (currentPlayerPropertiesElem) {
    if (currentPlayer.properties.length > 0) {
      currentPlayerPropertiesElem.innerHTML = ""; // Очищаємо попередній список властивостей

      // Проходимо по кожному об'єкту нерухомості гравця
      currentPlayer.properties.forEach((property) => {
        // Створюємо елемент-обгортку для елемента списку
        const propertyItem = createPlayerPropertyItem(currentPlayer, property);
        // Додаємо елемент у DOM-контейнер
        currentPlayerPropertiesElem.appendChild(propertyItem);
      });
    }
  }
}

// Функція для створення елемента списку з властивістю гравця (чекбокс + назва + колір)
const createPlayerPropertyItem = (player, property) => {
  const propertyItem = document.createElement("div");
  propertyItem.className = "trade-property-item";

  // Унікальний ID для зв'язки <input> та <label>
  const checkboxId = `trade-prop-${player.id || player.name}-${property.name}`;

  // Генеруємо HTML-вміст: чекбокс + колір карти (групи) + назва ділянки
  propertyItem.innerHTML = `
            <input 
                type="checkbox" 
                id="${checkboxId}" 
                value="${property.cost}" 
                data-player-id="${player.id || player.name}"
                class="trade-checkbox"
                data-properti-position="${property.position}"
            >
            <label for="${checkboxId}" class="trade-property-label">
                <span class="trade-color-badge" style="background-color: ${property.color || "#ccc"};"></span>
                <span class="trade-property-name">${property.name}</span>
                <span class="trade-property-price">(${property.cost} $)</span>
            </label>
        `;
  return propertyItem;
};

// Show modal trade window
export function openTradeModal() {
  const overlay = document.getElementById("trade-modal-overlay");
  overlay.classList.remove("trade-hidden");
}

// Функція для збору виділених ID ділянок з обраного контейнера чекбоксів
const getSelectedProperties = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return [];

  const checkboxes = container.querySelectorAll(
    'input[type="checkbox"]:checked',
  );

  let plotIds = [];
  const plotPosition = Array.from(checkboxes).map(
    (cb) => cb.dataset.propertiPosition,
  );

  //console.log("getSelectedProperties: ", plotPosition);

  plotPosition.forEach((pos) => {
    const plot = map.getPlotByPosition(parseInt(pos));
    console.log("Selected plot for trade: ", plot);
    plotIds.push(plot);
  });

  return plotIds;
};

// ГОЛОВНА ФУНКЦІЯ ВИКОНАННЯ ОБМІНУ
export const confirmTrade = (currentPlayer, opponentPlayer) => {
  if (!currentPlayer || !opponentPlayer) {
    alert(
      "Неможливо виконати обмін: не обрано гравців. ERROR: tradeUI.js - confirmTrade",
    );
    return;
  }

  console.log("currentPlayer: ", currentPlayer);
  console.log("opponentPlayer: ", opponentPlayer);

  // 1. Отримуємо суми грошей з інпутів
  const playerMoneyOffer =
    parseInt(document.getElementById("trade-offer-money").value) || 0;

  console.log("trade-offer-money", playerMoneyOffer);

  const opponentMoneyOffer =
    parseInt(document.getElementById("trade-request-money").value) || 0;

  console.log("trade-request-money", opponentMoneyOffer);

  // Перевірка на платоспроможність
  if (currentPlayer.balance < playerMoneyOffer) {
    alert(`У вас недостатньо коштів! Ваш баланс: $${currentPlayer.balance}`);
    return;
  }
  if (opponentPlayer.balance < opponentMoneyOffer) {
    alert(
      `У гравця ${opponentPlayer.name} недостатньо коштів! Баланс: $${opponentPlayer.balance}`,
    );
    return;
  }

  // 2. Збираємо списки майна для обміну (за ID ділянок)
  const playerPropsToGive = getSelectedProperties("trade-offer-properties");
  const opponentPropsToGive = getSelectedProperties("trade-request-properties");

  console.log("playerPropsToGive: ", playerPropsToGive);
  console.log("opponentPropsToGive: ", opponentPropsToGive);

  if (
    playerMoneyOffer === 0 &&
    opponentMoneyOffer === 0 &&
    playerPropsToGive.length === 0 &&
    opponentPropsToGive.length === 0
  ) {
    alert(
      "Угода порожня! Оберіть хоча б якісь ділянки або вкажіть суму грошей.",
    );
    return;
  }

  // Підтвердження угоди користувачем
  const confirmMessage = `${opponentPlayer.name} Ви впевнені, що хочете укласти цю угоду з ${currentPlayer.name}?`;
  if (!confirm(confirmMessage)) return;

  // 3. ПРОВЕДЕННЯ ФІНАНСОВОЇ ОПЕРАЦІЇ
  currentPlayer.balance -= playerMoneyOffer;
  currentPlayer.balance += opponentMoneyOffer;

  opponentPlayer.balance -= opponentMoneyOffer;
  opponentPlayer.balance += playerMoneyOffer;

  // 4. ПЕРЕДАЧА НЕРУХОМОСТІ
  if (playerPropsToGive.length > 0) {
    playerPropsToGive.forEach((plotOut) => {
      handlePropertyOwnership(currentPlayer, plotOut, false); // Видаляємо ділянку з поточного гравця
      handlePropertyOwnership(opponentPlayer, plotOut, true); // Додаємо ділянку опоненту
    });
  }

  if (opponentPropsToGive.length > 0) {
    opponentPropsToGive.forEach((plotIn) => {
      handlePropertyOwnership(opponentPlayer, plotIn, false); // Видаляємо ділянку з опонента
      handlePropertyOwnership(currentPlayer, plotIn, true); // Додаємо ділянку поточному гравцю
    });
  }
  // 5. ОНОВЛЕННЯ СТАНУ І КАРТИ ГРИ
  alert("Угоду успішно укладено! Власність та гроші переоформлено.");

  // Обов'язково викликаємо твої глобальні функції оновлення UI Монополії
  playerMain.updatePlayer();
  playerMain.updateUI();

  // Закриваємо вікно торгівлі
  closeModal();
};

/**
 * Функція для керування власністю ділянки гравця.
 * @param {Object} player - Об'єкт гравця (поточний гравець або опонент)
 * @param {Object} plot - Об'єкт ділянки (клітинки мапи)
 * @param {boolean} shouldAdd - true для додавання ділянки гравцеві, false для видалення
 */
function handlePropertyOwnership(player, plot, shouldAdd) {
  if (!plot) {
    console.error(
      "Помилка: Об'єкт ділянки (plot) не передано або він некоректний.",
    );
    return false;
  }

  // Перевіряємо, чи є ця ділянка вже у масиві properties цього гравця
  const existingIndex = player.properties.findIndex((prop) => {
    //console.log("Порівнюємо ділянки: ", prop, plot);
    return prop.position === plot.position;
  });

  //console.log("existingIndex: ", existingIndex, "для plot: ", plot);
  //console.log("Player before:", player);

  if (shouldAdd) {
    // Логіка додавання ділянки гравцеві
    if (existingIndex === -1) {
      player.properties.push(plot);
      plot.owner = player.name; // Прив'язуємо ID гравця як власника до клітинки карти
      console.log(
        `Ділянку "${plot.name}" успішно додано гравцю ${player.name}`,
      );
    } else {
      console.warn(`Ділянка "${plot.name}" вже належить гравцю ${player.name}`);
    }
  } else {
    // Логіка видалення ділянки у гравця
    if (existingIndex !== -1) {
      player.properties.splice(existingIndex, 1);
      plot.owner = "bank"; // Звільняємо ділянку на карті (стає нічийною/банківською)
      console.log(
        `Ділянку "${plot.name}" видалено з власності гравця ${player.name}`,
      );
    } else {
      console.warn(
        `Гравець ${player.name} не володіє ділянкою "${plot.name}", її неможливо видалити.`,
      );
    }
  }

  //console.log("Player after:", player);
  return true;
}
