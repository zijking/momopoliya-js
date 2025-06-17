import { logAction } from "./utils.js";

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
    logAction(`${player.emoji} ${player.name} пройшов «Старт» і отримує $200 💰`);
  }
};

// Функція для сплати оренди власнику ділянки
const payRentToOwner = (player, plot, players) => {

  if (!plot.owner || plot.owner === "bank" || plot.owner === player.name)
    return false;

  const owner = players.find((p) => p.name === plot.owner);
  if (!owner) return false;

  let rent = 0;

  // Якщо це залізниця, обчислюємо оренду за кількістю залізниць у власності
  if (plot.type === 'railway') {
    rent = getRailwayRent(owner);
    logAction(`${player.name} сплатив оренду $${rent} за залізницю гравцю ${owner.name}`);// лог дії
  } else if (plot.type === 'company') {
    rent = getCompanyRent(owner, player.lastRoll || 1); // передається кидок
    logAction(`${player.name} сплатив $${rent} за компанію ${plot.name} гравцю ${owner.name} (x${rent / player.lastRoll})`);// лог дії
  } else {
    logAction(`${player.emoji} ${player.name} сплатив оренду $${plot.rent} гравцю ${plot.owner}`); // лог дії
    rent = plot.rent || 0;
  }
    // player.updateBalance(-rent);
    // owner.updateBalance(+rent);
  const success = player.pay(rent, owner);
  return success;
};

// Функція для підрахунку кількості залізниць, що належать гравцеві
const countRailwaysOwnedBy = (player) =>{
  return player.properties.filter(p => p.type === 'railway').length;
}

// Функція для отримання оренди за залізницю
const getRailwayRent = (ownerPlayer)  => {
  const count = countRailwaysOwnedBy(ownerPlayer);
  return 25 * Math.pow(2, count - 1); // 25, 50, 100, 200
}

// Функція для підрахунку кількості комунальних підприємств, що належать гравцеві
const countUtilityCompaniesOwnedBy = (player) => {
  return player.properties.filter(p => p.type === 'company').length;
}

// Функція для отримання оренди за комунальне підприємство
const getCompanyRent = (ownerPlayer, roll) => {
  const count = countUtilityCompaniesOwnedBy(ownerPlayer);
  console.log("Count of companies: ", count);
  if (count === 2) return 10 * roll;
  return 4 * roll;
}




export default {
  buyPlot,
  salaryCheck,
  payRentToOwner
};
