// Функція для виконання обміну між двома гравцями
const executeTrade = (initiator, target, tradeOffer) => {
  const {
    offerMoney = 0, // Гроші, які віддає ініціатор
    requestMoney = 0, // Гроші, які просить ініціатор
    offerPlots = [], // Масив об'єктів ділянок, які віддає ініціатор
    requestPlots = [], // Масив об'єктів ділянок, які просить ініціатор
  } = tradeOffer;

  // 1. Перевірка платоспроможності обох гравців
  if (initiator.balance < offerMoney) {
    console.error(`У ${initiator.name} недостатньо грошей для обміну.`);
    return false;
  }
  if (target.balance < requestMoney) {
    console.error(`У ${target.name} недостатньо грошей для обміну.`);
    return false;
  }

  // 2. Обмін грошима
  if (offerMoney > 0) {
    initiator.updateBalance(-offerMoney);
    target.updateBalance(offerMoney);
  }
  if (requestMoney > 0) {
    target.updateBalance(-requestMoney);
    initiator.updateBalance(requestMoney);
  }

  // 3. Передача майна від ініціатора до цілі
  offerPlots.forEach((plot) => {
    plot.owner = target.name; // Оновлюємо власника на самій ділянці
    // Видаляємо з масиву старого власника
    initiator.properties = initiator.properties.filter(
      (p) => p.name !== plot.name,
    );
    // Додаємо новому власнику
    target.properties.push(plot);
  });

  // 4. Передача майна від цілі до ініціатора
  requestPlots.forEach((plot) => {
    plot.owner = initiator.name;
    target.properties = target.properties.filter((p) => p.name !== plot.name);
    initiator.properties.push(plot);
  });

  // Логування події
  logAction(
    `🤝 ${initiator.emoji} ${initiator.name} та ${target.emoji} ${target.name} успішно здійснили обмін!`,
  );

  return true;
};
