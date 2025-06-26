import { logAction } from "./utils.js";
import { emojiSet } from "./emojiSet.js";

// js/cardEvents.js
// --------------------------------------------------
// Завантаження та обробка карток «Шанс» і «Бюджет»
// --------------------------------------------------

import { playerMain } from "./playerMove.js";
import actionPlayer from "./playerActions.js";
import { showModal } from "./modal.js"; // твоя функція модалки

/* джерела JSON-файлів */
const CARD_SRC = {
  chance: "./src/chanceCard.json",
  budget: "./src/budgetCard.json",
};

/* кеш, щоб не тягнути файли щоразу */
const cardCache = {
  chance: null,
  budget: null,
};

/* асинхронно завантажує масив карток та кешує */
export async function loadCards(type) {
  if (cardCache[type]) return cardCache[type];

  const res = await fetch(CARD_SRC[type]);
  const data = await res.json();
  cardCache[type] = data;
  return data;
}

/**
 * Витягує випадкову картку type ('chance' або 'budget'),
 * застосовує її ефект, а тоді викликає onComplete() для
 * продовження ходу (finishTurn / nextTurn).
 */
export async function handleCardDraw(
  type,
  player,
  onComplete,
  plot,
  isDouble,
  players
) {
  // console.log(`handleCardDraw RUN: ${type}`, player);
  const cards = await loadCards(type);
  const card = cards[Math.floor(Math.random() * cards.length)];

  logAction(
    `${player.emoji} ${player.name} тягне картку ${
      emojiSet.fields[type]
    } ${type.toUpperCase()}: «${card.message}»`
  );
  // console.log("emojiSet.fields.type: ", type);

  // показуємо текст картки в модалці
  showModal(card.message, () => {
    /* ► Гроші (value) */
    if (typeof card.value === "number" && card.value !== 0) {
      if (card.value > 0) {
        player.updateBalance(card.value);
        logAction(`${player.emoji} ${player.name} отримує $${card.value}`);
      } else {
        player.pay(Math.abs(card.value));
        logAction(
          `${player.emoji} ${player.name} сплачує $${Math.abs(card.value)}`
        );
      }
    }

    /* ► Переміщення по полю (position) */
    if (typeof card.position === "number") {
      let target = card.position;

      // від'ємне — крок назад
      if (card.position < 0) {
        target = (player.position + card.position + 40) % 40;
      }
   
      const passedStart = target < player.position && !card.jail;
      player.position = target;

      if (passedStart) {
        player.updateBalance(200);
        logAction(
          `${player.emoji} ${player.name} проходить Старт і отримує $200`
        );
      }
      // оновлюємо позицію гравця
      playerMain.hundelByPlotOrPayrent(plot, player, 0, isDouble);
    }

    /* ► Тюрма */
    if (card.jail) {
      player.position = 10; // позиція в'язниці
      player.inJail = true;
      logAction(`${player.emoji} ${player.name} потрапляє у в'язницю 🚓`);
      playerMain.updatePlayer();
    }

    playerMain.updateUI(); // оновити панель гравців / баланс

    /* повертаємо керування циклу гри */
    if (typeof onComplete === "function") onComplete();
  });
}
