import { playerMain } from "./playerMove.js";
import { tradeUI } from "./tradeUI.js";

//Ініціалізація гри. Підписка подій для інтерфейсу торгівлі та початкові налаштування гри
export function initGame() {
  console.log("Гра ініціалізована");
  // Тут можна додати будь-яку логіку, яка потрібна для початку гри
  tradeUI(playerMain.getAllPlayers()); // Ініціалізуємо інтерфейс торгівлі
}


