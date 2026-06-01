import { playerMain } from "./playerMove.js";
import { logAction } from "./utils.js";
import { showModalWithChoices } from "./modal.js";

import map from "./map.js";

//купівля ділянки
const buyPlot = (player, plot) => {
  player.updateBalance(-plot.cost);
  player.addProperty(plot);
  plot.owner = player.name;
};

// Функція для перевірки зарплати гравця
const salaryCheck = (player, roll) => {
  // console.log("salaryCheck: ", player, roll);

  const previousPosition = player.position;

  const newPosition = (previousPosition + roll) % 40;

  // console.log("New position: ", newPosition);

  if (newPosition < previousPosition) {
    player.updateBalance(200);
    // alert(`${player.name} пройшов «Старт» і отримує $200 💰`);
    logAction(
      `${player.emoji} ${player.name} пройшов «Старт» і отримує $200 💰`,
    );
  }
};

// Функція для сплати оренди власнику ділянки
// const payRentToOwner = (player, plot, players) => {
//   if (!plot.owner || plot.owner === "bank" || plot.owner === player.name)
//     return false;

//   const owner = players.find((p) => p.name === plot.owner); // знайти власника ділянки
//   if (!owner) return false;

//   if (plot.mortgage) {
//     logAction(
//       `${player.emoji} ${player.name} не сплачує оренду за заставлену ділянку ${plot.name}`
//     ); // лог дії
//     return false;
//   } // 🔑 у заставі → rent = 0

//   let rent = 0;

//   // Якщо це залізниця, обчислюємо оренду за кількістю залізниць у власності
//   if (plot.type === "railway") {
//     rent = getRailwayRent(owner);
//     logAction(
//       `${player.emoji}${player.name} сплатив оренду $${rent} за залізницю гравцю ${owner.name}`
//     ); // лог дії
//   } else if (plot.type === "company") {
//     rent = getCompanyRent(owner, player.lastRoll || 1); // передається кидок
//     logAction(
//       `${player.emoji}${player.name} сплатив $${rent} за компанію ${
//         plot.name
//       } гравцю ${owner.name} (x${rent / player.lastRoll})`
//     ); // лог дії
//   } else {
//     logAction(
//       `${player.emoji} ${player.name} сплатив оренду $${plot.rent} гравцю ${plot.owner}`
//     ); // лог дії
//     rent = plot.rent || 0;
//   }
//   // player.updateBalance(-rent);
//   // owner.updateBalance(+rent);
//   const success = player.pay(rent, owner);
//   return success;
// };

// Функція для сплати оренди власнику ділянки
const payRentToOwner = (player, plot, players) => {
  if (!plot.owner || plot.owner === "bank" || plot.owner === player.name)
    return false;

  const owner = players.find((p) => p.name === plot.owner); // знайти власника ділянки
  if (!owner) return false;

  if (plot.mortgage) {
    logAction(
      `${player.emoji} ${player.name} не сплачує оренду за заставлену ділянку ${plot.name}`,
    ); // лог дії
    return false;
  } // 🔑 у заставі → rent = 0

  let rent = 0;

  // Якщо це залізниця, обчислюємо оренду за кількістю залізниць у власності
  if (plot.type === "railway") {
    rent = getRailwayRent(owner);
    logAction(
      `${player.emoji} ${player.name} сплатив оренду $${rent} за залізницю гравцю ${owner.name}`,
    ); // лог дії
  }
  // Якщо це компанія (комунальне підприємство)
  else if (plot.type === "company") {
    rent = getCompanyRent(owner, player.lastRoll || 1); // передається кидок
    logAction(
      `${player.emoji} ${player.name} сплатив $${rent} за компанію ${plot.name} гравцю ${owner.name} (x${rent / player.lastRoll})`,
    ); // лог дії
  }
  // --- НОВА ЛОГІКА: Класична нерухомість (Вулиці) ---
  else {
    if (plot.hasHotel) {
      // 🏨 Перевірка на готель
      // Якщо в JSON немає rentHotel, ставимо тимчасовий множник (наприклад, базова х 10)
      rent = plot.rentHotel || plot.rent * 10;
      logAction(
        `${player.emoji} ${player.name} сплатив оренду $${rent} (🏨 Готель) гравцю ${owner.name}`,
      );
    } else if (plot.houses > 0) {
      // 🏠 Перевірка на будинки (від 1 до 4)
      // Очікуємо, що в JSON є масив rentHouses: [100, 300, 500, 800]
      if (plot.rentHouses && plot.rentHouses.length >= plot.houses) {
        rent = plot.rentHouses[plot.houses - 1]; // Індекс на 1 менше за кількість будинків
      } else {
        // Тимчасовий фолбек, якщо масиву в JSON ще немає (базова х 2 за кожен будинок)
        rent = plot.rent * (plot.houses * 2);
      }
      logAction(
        `${player.emoji} ${player.name} сплатив оренду $${rent} (🏠 x${plot.houses}) гравцю ${owner.name}`,
      );
    } else {
      // 🟩 Базова оренда (порожня ділянка)
      // ПЕРЕВІРКА НА МОНОПОЛІЮ:
      const isMonopoly = plot.color && hasFullColorSet(owner, plot.color);

      if (isMonopoly) {
        rent = (plot.rent || 0) * 2; // Подвоюємо ренту
        logAction(
          `${player.emoji} ${player.name} сплатив ПОДВІЙНУ оренду $${rent} (Монополія 🎨) гравцю ${owner.name}`,
        );
      } else {
        rent = plot.rent || 0; // Звичайна рента
        logAction(
          `${player.emoji} ${player.name} сплатив базову оренду $${rent} гравцю ${owner.name}`,
        );
      }
    }
  }

  // Виконуємо транзакцію
  const success = player.pay(rent, owner);
  return success;
};

// Функція для підрахунку кількості залізниць, що належать гравцеві
const countRailwaysOwnedBy = (player) => {
  return player.properties.filter((p) => p.type === "railway").length;
};

// Функція для отримання оренди за залізницю
const getRailwayRent = (ownerPlayer) => {
  const count = countRailwaysOwnedBy(ownerPlayer);
  return 25 * Math.pow(2, count - 1); // 25, 50, 100, 200
};

// Функція для підрахунку кількості комунальних підприємств, що належать гравцеві
const countUtilityCompaniesOwnedBy = (player) => {
  return player.properties.filter((p) => p.type === "company").length;
};

// Функція для отримання оренди за комунальне підприємство
const getCompanyRent = (ownerPlayer, roll) => {
  const count = countUtilityCompaniesOwnedBy(ownerPlayer);
  console.log("Count of companies: ", count);
  if (count === 2) return 10 * roll;
  return 4 * roll;
};

// Функція для застави ділянки
const mortgagePlot = (player, plot) => {
  if (plot.owner !== player.name || plot.mortgage) return false;

  plot.mortgage = true;
  const payout = Math.floor(plot.cost / 2);
  player.updateBalance(payout);

  logAction(
    `🏦 ${player.emoji} ${player.name} здає ${plot.name} в заставу й отримує $${payout}`,
  );
  playerMain.highlightOwnedProperties(); // виділяємо сірим
  playerMain.updateUI();
  return true;
};

// Функція для викупу заставленої ділянки
const redeemPlot = (player, plot) => {
  if (plot.owner !== player.name || !plot.mortgage) return false;

  const redemption = Math.ceil(plot.cost * 1.1); // +10 %
  if (player.balance < redemption) return false;

  plot.mortgage = false;
  player.updateBalance(-redemption);

  logAction(
    `💵 ${player.emoji} ${player.name} викуповує ${plot.name} за $${redemption}`,
  );
  playerMain.highlightOwnedProperties();
  playerMain.updateUI();
  return true;
};

// 🔹 Функція для обробник кліку для застави
const mortgagePlotOrNot = (plot) => {
  console.log("THIS cell: ", plot);

  const current = playerMain.getCurrentPlayer();
  console.log("Current player in MORTGAGE: ", current);

  if (plot.owner !== current.name) return;

  if (!plot.mortgage) {
    showModalWithChoices(`Здати ${plot.name} в заставу за $${plot.cost / 2}?`, [
      { label: "✅ Заставити", onClick: () => mortgagePlot(current, plot) },
      {
        label: "❌ Скасувати",
        onClick: () => {
          playerMain.updateUI();
        },
      },
    ]);
  } else {
    const redemption = Math.ceil(plot.cost * 1.1);
    showModalWithChoices(`Викупити ${plot.name} за $${redemption}?`, [
      { label: "✅ Викупити", onClick: () => redeemPlot(current, plot) },
      {
        label: "❌ Скасувати",
        onClick: () => {
          playerMain.updateUI();
        },
      },
    ]);
  }
};

// Функція перевірки, чи зібрав гравець всі ділянки одного кольору
const hasFullColorSet = (owner, colorGroup) => {
  if (!colorGroup) return false; // Захист для полів без кольору (залізниці, компанії)

  const allPlots = map.getAllPlots(); // Отримуємо всі поля з мапи

  // Рахуємо, скільки всього ділянок такого кольору на дошці
  const totalPlotsInGroup = allPlots.filter(
    (p) => p.color === colorGroup,
  ).length;

  // Рахуємо, скільки з них належить власнику
  const ownerPlotsInGroup = owner.properties.filter(
    (p) => p.color === colorGroup,
  ).length;

  // Якщо кількість збігається — це монополія!
  return totalPlotsInGroup > 0 && totalPlotsInGroup === ownerPlotsInGroup;
};

// Ініціалізація кліків для будівництва
const initBuildingClicks = () => {
  // Додаємо слухач подій на всі клітинки поля
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      // Отримуємо індекс клітинки, по якій клікнули
      const plotIndex = parseInt(cell.getAttribute("data-index"));
      const plot = map.getAllPlots().find((p) => p.position === plotIndex);
      const player = getCurrentPlayer();

      // 1. Чи є ця ділянка взагалі і чи належить вона тому, чий зараз хід?
      if (!plot || plot.owner !== player.name) return;

      // 2. Чи є монополія?
      if (!hasFullColorSet(player, plot.color, map.getAllPlots())) {
        alert("Вам потрібні всі ділянки цього кольору для будівництва!");
        return;
      }

      // 3. Запитуємо підтвердження через твою готову модалку
      const buildCost = plot.houseCost || 50;
      showModalWithChoices(
        `Побудувати нерухомість на ${plot.name} за $${buildCost}?`,
        [
          {
            label: "✅ Так",
            onClick: () => {
              const success = buildEstate(player, plot, map.getAllPlots());
              if (success) {
                updateBoardBuildings(map.getAllPlots());
                updateUI();
              }
            },
          },
          {
            label: "❌ Скасувати",
            onClick: () => {}, // Нічого не робимо
          },
        ],
      );
    });
  });
};

export default {
  buyPlot,
  salaryCheck,
  payRentToOwner,
  mortgagePlot,
  redeemPlot,
  mortgagePlotOrNot,
  initBuildingClicks,
};
