//купівля ділянки
const buyPlot = (player, plot) => {
    player.updateBalance(-plot.cost);
    player.addProperty(plot);
    plot.owner = player.name;
}

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
}


export default{
    buyPlot,
    salaryCheck
}