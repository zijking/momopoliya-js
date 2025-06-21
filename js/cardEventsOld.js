import { logAction } from "./utils.js";
import { playerMain } from "./playerMove.js";

export async function loadCards(type) {
  const url =
    type === "chance" ? "../src/chanceCard.json" : "../src/budgetCard.json";
  const response = await fetch(url);
  return await response.json();
}

const chanceCards = await loadCards("chance");
const budgetCards = await loadCards("budget");

const handleCardDraw = (type, player) => {
  const cards = type === "chance" ? chanceCards : budgetCards;
  console.log("cards", cards);

  const randomnumber = Math.floor(Math.random() * cards.length);
  console.log("randomnumber", randomnumber);

  const randomCard = cards[randomnumber];

  logAction(`🃏 ${player.emoji} ${player.name}: ${randomCard.message}`);

  // Переміщення по полю
  if (typeof randomCard.position === "number") {
    let newPosition = randomCard.position;
    if (randomCard.position < 0) {
      newPosition = (player.position + randomCard.position + 40) % 40;
    }

    const passedStart = newPosition < player.position;
    player.position = newPosition;
    if (passedStart && !randomCard.jail) {
      player.updateBalance(200);
      logAction(
        `${player.emoji} ${player.name} проходить Старт і отримує $200`
      );
    }

    playerMain.updatePlayer(); // оновити фішки на полі
  }

  // Тюрма
  if (randomCard.jail) {
    player.position = 10; // позиція в'язниці
    player.inJail = true;
    logAction(`${player.name} потрапляє у в'язницю 🧱`);
  } else if (randomCard.jail === false) {
    player.addProperty(randomCard); // додати ділянку до гравця
  }

  // Гроші
  if (typeof randomCard.value === "number" && randomCard.value !== 0) {
    if (randomCard.value > 0) {
      player.updateBalance(randomCard.value);
    } else {
      player.pay(Math.abs(randomCard.value));
    }
  }

  console.log("playerCardEvent", player);
  playerMain.updateUI();
};

export { handleCardDraw };
