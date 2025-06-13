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
    console.log("Plot: ", plot);
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
    if (plot.position >= 0 && plot.position < 11) side = "bottom"; // нижній ряд
    else if (plot.position >= 11 && plot.position < 21)
      side = "left"; // ліва колона
    else if (plot.position >= 21 && plot.position < 31)
      side = "top"; // верхній ряд
    else side = "right"; // права колона
    cell.classList.add(`side-${side}`); // додаємо клас виду side-top / side-left / …

    // 🔹 Додаємо інформацію про клітинку
    const info = document.createElement("div");
    info.style.zIndex = "1"; // Щоб був поверх кольору
    info.innerHTML = `<strong>${plot.name || "#" + plot.position}</strong>`;
    if (plot.cost) info.innerHTML += `<br>💰 ${plot.cost}`;
    if (plot.rent) info.innerHTML += `<br>🏠 ${plot.rent}`;
    cell.appendChild(info);

    /* ==== ДОДАТКОВИЙ БЛОК З РЕНТОЮ ===================================== */
    if (plot.rentLandPlot !== undefined) {
      const details = document.createElement("div");
      details.className = "details";

      if (plot.type === "landPlot") {
        const lines = [];
        // без будинків
        lines.push(`Без буд.: $${plot.rentLandPlot}`);

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
            lines.push(`${idx + 1} Ком.: $x${val}<br>` + (idx === 0 ? "(кидка кубиків)" : ""));
          });
        }
        details.innerHTML = lines.join("<br>");
      } else {
        details.innerHTML = "Немає даних про ренту";
      }

      cell.appendChild(details);
    }
    // ==== КІНЕЦЬ ДОДАТКОВОГО БЛОКУ З РЕНТОЮ ================================ */
    // Додаємо дані до клітинки
    cell.dataset.index = plot.position;
    // Додаємо дані про тип клітинки
    cell.dataset.mainCost = plot.cost;
    board.appendChild(cell);
    // allPlots.push(plot); // 🔹 Додаємо клітинку до загального масиву
    cells.push(cell);
  };

  const renderBoard = () => {
    landPlots.forEach(placeCell);
    companyPlots.forEach(placeCell);
    mainAreas.forEach(placeCell);
    // console.log(companyPlots);
  };
};

const getAllPlots = () => {
  return allPlots;
};

export default {
  buildMap,
  getAllPlots,
};
