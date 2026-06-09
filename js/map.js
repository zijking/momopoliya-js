import playerActions from "./playerActions.js";


const landPlots = []; // 🔹 Масив для полів з landPlots.json
const companyPlots = []; // 🔹 Масив для полів з companyPlots.json
const mainAreas = []; // Основні поля
const allPlots = []; // 🔹 Масив для всіх полів

// 🔹 Функція для побудови карти
const buildMap = () => {
  console.log("Start buildMap");

  const board = document.getElementById("board");

  const cellSize = 80;
  const boardSize = 880;
  const cells = [];

  Promise.all([
    fetch("./src/landPlots.json").then((res) => res.json()),
    fetch("./src/companyPlots.json").then((res) => res.json()),
    fetch("./src/mainAreas.json").then((res) => res.json()),
  ]).then(([lands, companies, mainAr]) => {
    landPlots.push(...lands);
    companyPlots.push(...companies);
    mainAreas.push(...mainAr);

    allPlots.push(...landPlots, ...companyPlots, ...mainAreas); // 🔹 Об'єднуємо всі масиви в один

    renderBoard();
    
    // updatePlayer();
  });
  // 🔹 Функція для отримання координат клітинки на полі
  const getCoordinates = (position) => {
    if (position >= 0 && position < 11)
      return [boardSize - cellSize * (position + 1), boardSize - cellSize]; // bottom
    if (position >= 11 && position < 21)
      return [0, boardSize - cellSize * (position - 9)]; // left
    if (position >= 21 && position < 31) return [cellSize * (position - 20), 0]; // top
    if (position >= 31 && position < 40)
      return [boardSize - cellSize, cellSize * (position - 30)]; // right
    return [0, 0];
  };

  // 🔹 Функція для розміщення клітинки на полі
  const placeCell = (plot) => {
    // console.log("Plot: ", plot);
    const [x, y] = getCoordinates(plot.position);
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.style.left = `${x}px`;
    cell.style.top = `${y}px`;

    if (plot.color) {
      const colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = plot.color;
      cell.appendChild(colorBox);
    }
    /* ==== Визначаємо, на якій стороні дошки клітинка =============== */
    let side = ""; // Змінна для сторони клітинки
    if (plot.position >= 0 && plot.position < 11)
      side = "bottom"; // нижній ряд
    else if (plot.position >= 11 && plot.position < 21)
      side = "left"; // ліва колона
    else if (plot.position >= 21 && plot.position < 31)
      side = "top"; // верхній ряд
    else side = "right"; // права колона
    cell.classList.add(`side-${side}`); // додаємо клас виду side-top / side-left / …

    // Додаємо інформацію про клітинку
    const info = document.createElement("div");
    info.className = "info-text"; // ⬅️ даємо новий клас
    info.innerHTML = `<strong>${plot.name || "#" + plot.position}</strong>`;
    if (plot.cost) info.innerHTML += `<br>💰 ${plot.cost}`;
    if (plot.rent) info.innerHTML += `<br>🏠 ${plot.rent}`;
    if (plot.type === "parking") {
      info.innerHTML += `<br><span class="parking-amount">$${
        plot.cost || 0
      }</span>`;
    }
    cell.appendChild(info);

    /* контейнер для фішок */
    const tokenContainer = document.createElement("div");
    tokenContainer.className = "player-tokens-container";
    cell.appendChild(tokenContainer);
    // console.log("Plot.RentLandPlot ", plot.rentLandPlot);

    // Додаємо дані до клітинки
    cell.dataset.index = plot.position;
    // Додаємо дані про тип клітинки
    cell.dataset.mainCost = plot.cost;

    const details = getDetails(plot);
    if (details) {
      cell.appendChild(details); // Додаємо деталі клітинки
    }

    const tokenOverlay = document.createElement("div");
    tokenOverlay.className = "token-overlay"; // додатковий блок для фішок
    cell.appendChild(tokenOverlay);

    cell.onclick = () => {
      playerActions.mortgagePlotOrNot(plot);
    }; // 🔹 Додаємо обробник кліку для застави
    
    board.appendChild(cell);
    // allPlots.push(plot); // 🔹 Додаємо клітинку до загального масиву
    cells.push(cell);

    
  };

  // 🔹 Рендеримо всі клітинки на полі
  const renderBoard = () => {
    landPlots.forEach(placeCell);
    companyPlots.forEach(placeCell);
    mainAreas.forEach(placeCell);
    // console.log(companyPlots);
  };
};

const getPlotByPosition = (position) => {
  return allPlots.find((plot) => plot.position === position);
};

// 🔹 Функція для отримання всіх клітинок
const getAllPlots = () => {
  return allPlots;
};

// 🔹 Функція для отримання деталей клітинки
const getDetails = (plot) => {
  // console.log("Plot: ", plot);

  const details = document.createElement("div");
  details.className = "details";

  if (plot.type === "landPlot") {
    const lines = [];
    // без будинків
    lines.push(`Без буд.: $${plot.rent}`);
    // з будинками
    if (Array.isArray(plot.rentWithHouse)) {
      plot.rentWithHouse.forEach((val, idx) => {
        lines.push(`${idx + 1} буд.: $${val}`);
      });
    }
    // з готелем
    if (plot.rentWithHotel) {
      lines.push(`Готель: $${plot.rentWithHotel}`);
    }
    details.innerHTML = lines.join("<br>");
  } else if (plot.type === "railway") {
    const lines = [];
    // з 1 по 4 залізниці
    if (Array.isArray(plot.rentWithHouse)) {
      plot.rentWithHouse.forEach((val, idx) => {
        lines.push(`${idx + 1} зал.: $${val}`);
      });
    }
    details.innerHTML = lines.join("<br>");
  } else if (plot.type === "company") {
    const lines = [];
    // з 1 по 2 компанії
    if (Array.isArray(plot.rentWithHouse)) {
      plot.rentWithHouse.forEach((val, idx) => {
        lines.push(`${idx + 1} Ком.: $x${val}<br>` + "(кидка кубиків)");
      });
    }
    details.innerHTML = lines.join("<br>");
  } else {
    return null; // суд, парковка, в'язниця та інші не мають деталей
  }

  // console.log("Details: ", details);
  return details;
};

export default {
  buildMap,
  getAllPlots,
  getPlotByPosition,
};
