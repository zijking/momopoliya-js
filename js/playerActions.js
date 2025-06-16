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
    alert(`${player.name} пройшов «Старт» і отримує $200 💰`);
  }
};

// Функція для сплати оренди власнику ділянки
const payRentToOwner = (player, plot, players) => {

  if (!plot.owner || plot.owner === "bank" || plot.owner === player.name)
    return false;

  const owner = players.find((p) => p.name === plot.owner);
  if (!owner) return false;

  const rent = plot.rent || 0;

    // player.updateBalance(-rent);
    // owner.updateBalance(+rent);
  const success = player.pay(rent, owner);
  return success;
};

export default {
  buyPlot,
  salaryCheck,
  payRentToOwner,
};
