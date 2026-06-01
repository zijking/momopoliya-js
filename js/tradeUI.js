import { playerMain } from "./playerMove.js";



// Функція обробника кліку на кнопку відкриття ринкової модалки
export function onTradeButtonClick(players) {
  console.log("Відкриваємо ринкову модалку для гравця:", playerMain.getCurrentPlayer()); // Виводимо в консоль ім'я гравця, для якого відкривається модалка

  const currentPlayerNameElem = document.getElementById("trade-player"); // Елемент для відображення імені поточного гравця в заголовку модалки

  if (currentPlayerNameElem) {
    currentPlayerNameElem.innerText = `${playerMain.getCurrentPlayer().emoji} ${playerMain.getCurrentPlayer().name}`; // Встановлюємо ім'я поточного гравця в заголовок модалки
  }
  setupSelectOptions(players); // Заповнюємо селект з гравцями для вибору партнера по торгівлі
  setPlayerProperties(); // Відображаємо властивості поточного гравця в модалці
  openTradeModal(); // Відкриваємо модалку торгівлі
};

// Функція для заповнення селекту з гравцями, з якими можна торгувати
export function setupSelectOptions(players) {
  const listPleyers = document.getElementById("trade-target-player-select"); // Селект для вибору гравця, з яким хочемо торгувати

  listPleyers.innerHTML = `
  <option value="" disabled selected>Оберіть гравця...</option>
`; // Очищаємо попередні опції та додаємо першу опцію з підказкою

  players.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent =
      player.name === playerMain.getCurrentPlayer().name
        ? `${player.emoji} ${player.name} (ви)`
        : `${player.emoji} ${player.name}`;
    listPleyers.appendChild(option);
  });
};

// Функція обробника зміни селекту для вибору гравця, з яким хочемо торгувати
export const selectOponentForTrade = (event) => {
  const selectedPlayerId = event.target.value; // Обробка вибору гравця для торгівлі
  const seletedPlayerAria = document.getElementById("trade-request-properties"); // Елемент для відображення нерухомості гравця, з яким хочемо торгувати
  seletedPlayerAria.innerHTML = ""; // Очищаємо попередній список властивостей

  const selectedPlayer = playerMain.getPlayerById(selectedPlayerId); // Отримуємо об'єкт вибраного гравця за його ID

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
    }
  }
};

// Ініціалізація ринкової модалки та додавання обробників подій для закриття
export function initTradeModal() {
  const overlay = document.getElementById("trade-modal-overlay");
  const closeBtn = document.getElementById("trade-close-icon");
  const cancelBtn = document.getElementById("trade-cancel-btn");

  // Функція для закриття модалки
  const closeModal = () => {
    overlay.classList.add("trade-hidden");
    // Тут потім будемо скидати всі чекбокси та поля вводу
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Закриття при кліку на темний фон (поза вікном)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
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
            >
            <label for="${checkboxId}" class="trade-property-label">
                <span class="trade-color-badge" style="background-color: ${property.color || "#ccc"};"></span>
                <span class="trade-property-name">${property.name}</span>
                <span class="trade-property-price">(${property.cost} $)</span>
            </label>
        `;
  return propertyItem;
};

// Тестовий виклик для перевірки візуалу
export function openTradeModal() {
  const overlay = document.getElementById("trade-modal-overlay");
  overlay.classList.remove("trade-hidden");
}
