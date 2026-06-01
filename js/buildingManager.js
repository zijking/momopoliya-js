// Функція перевірки, чи зібрав гравець монополію (всі картки одного кольору)
export const hasFullColorSet = (player, colorGroup, allPlots) => {
  // Рахуємо, скільки всього ділянок такого кольору на карті
  const totalPlotsInGroup = allPlots.filter(
    (p) => p.color === colorGroup,
  ).length;
  // Рахуємо, скільки з них належить поточному гравцеві
  const playerPlotsInGroup = player.properties.filter(
    (p) => p.color === colorGroup,
  ).length;

  return totalPlotsInGroup > 0 && totalPlotsInGroup === playerPlotsInGroup;
};

// Головна функція будівництва
export const buildEstate = (player, plot, allPlots) => {
  // 1. Перевірка на монополію
  if (!hasFullColorSet(player, plot.color, allPlots)) {
    alert("Спочатку потрібно викупити всі ділянки цього кольору!");
    return false;
  }

  // 2. Перевірка ліміту (готель — це максимум)
  if (plot.hasHotel) {
    alert("На цій ділянці вже стоїть готель. Більше будувати не можна.");
    return false;
  }

  // Вартість будинку (береться з JSON, якщо немає — дефолт 50)
  const buildCost = plot.houseCost || 50;

  // 3. Перевірка балансу
  if (player.balance < buildCost) {
    alert(`Недостатньо коштів! Будівництво коштує $${buildCost}`);
    return false;
  }

  // Ініціалізація змінних у об'єкті ділянки, якщо їх ще немає
  if (plot.houses === undefined) plot.houses = 0;
  if (plot.hasHotel === undefined) plot.hasHotel = false;

  // Знімаємо гроші
  player.updateBalance(-buildCost);

  // 4. Логіка апгрейду (від 1 до 4 будинків, потім 1 готель)
  if (plot.houses < 4) {
    plot.houses += 1;
    logAction(
      `${player.emoji} ${player.name} побудував будинок 🏠 на ${plot.name}`,
    );
  } else if (plot.houses === 4) {
    plot.houses = 0; // Зносимо 4 будинки
    plot.hasHotel = true; // Ставимо готель
    logAction(
      `${player.emoji} ${player.name} побудував ГОТЕЛЬ 🏨 на ${plot.name}`,
    );
  }

  return true; // Успішне будівництво
};
