// js/cardEvents.js
// --------------------------------------------------
// Завантаження та обробка карток «Шанс» і «Бюджет»
// --------------------------------------------------

import { updatePlayer, updateUI } from "./playerMove.js";
import { logAction } from "./logActions.js";
import { showModal } from "./modal.js"; // твоя функція модалки

/* джерела JSON-файлів */
const CARD_SRC = {
  chance: "../src/chanceCard.json",
  budget: "../src/budgetCard.json",
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
export async function handleCardDraw(type, player, onComplete) {
  const cards = await loadCards(type);
  const card = cards[Math.floor(Math.random() * cards.length)];

  logAction(
    `${player.emoji} ${player.name} тягне картку ${type.toUpperCase()}: «${
      card.message
    }»`
  );

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
      updatePlayer();

      if (passedStart) {
        player.updateBalance(200);
        logAction(
          `${player.emoji} ${player.name} проходить Старт і отримує $200`
        );
      }
    }

    /* ► Тюрма */
    if (card.jail) {
      player.position = 10; // позиція в'язниці
      player.inJail = true;
      logAction(`${player.emoji} ${player.name} потрапляє у в'язницю 🚓`);
      updatePlayer();
    }

    updateUI(); // оновити панель гравців / баланс

    /* повертаємо керування циклу гри */
    if (typeof onComplete === "function") onComplete();
  });
}
