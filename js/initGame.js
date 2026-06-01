import { playerMain } from "./playerMove.js";
import { onTradeButtonClick, setupSelectOptions, initTradeModal, selectOponentForTrade }from "./tradeUI.js";

//Ініціалізація гри. Підписка подій для інтерфейсу торгівлі та початкові налаштування гри
export function initGame() {
  console.log("Гра ініціалізована");
  // Тут можна додати будь-яку логіку, яка потрібна для початку гри
  tradeUI(playerMain.getAllPlayers()); // Ініціалізуємо інтерфейс торгівлі з поточним гравцем та списком всіх гравців
}

// Імпортуємо функції для роботи з інтерфейсом торгівлі
function tradeUI(players) {
  const tradeBtn = document.getElementById("open-trade-btn"); // 🔹 Кнопка для відкриття ринкової модалки
  const selectElement = document.getElementById("trade-target-player-select"); // Селект для вибору гравця, з яким хочемо торгувати
  initTradeModal(); // Ініціалізуємо модалку при завантаженні сторінки

  if (tradeBtn) {
    tradeBtn.addEventListener("click", () =>
      onTradeButtonClick(players),
    ); // Додаємо обробник кліку для відкриття ринкової модалки
  }

  selectElement.addEventListener("change", (event) =>
    selectOponentForTrade(event),
  ); // Додаємо обробник зміни селекту для вибору гравця, з яким хочемо торгувати
}
