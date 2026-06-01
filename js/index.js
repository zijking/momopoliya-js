import map from "./map.js";
import { playerMain } from "./playerMove.js";
import { initGame } from "./initGame.js";

const loadingText = document.getElementById("loading");

map.buildMap();

setTimeout(() => {
  playerMain.startPosition();
  initGame();
  loadingText.innerHTML = ""; // Прибираємо текст завантаження після 1.5 секунд
}, 1500);
