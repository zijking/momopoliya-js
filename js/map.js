const buildMap = () => {

    console.log("Start buildMap")
    const board = document.getElementById("board");    
    
    const cellSize = 80;
    const boardSize = 880;
    const cells = [];
    
    const landPlots = []; // 🔹 Масив для полів з landPlots.json
    const companyPlots = []; // 🔹 Масив для полів з companyPlots.json
    const mainAreas = []; // Основні поля

    Promise.all([
        fetch('./src/landPlots.json').then(res => res.json()),
        fetch('./src/companyPlots.json').then(res => res.json()),
        fetch('./src/mainAreas.json').then(res=>res.json())
    ]).then(([lands, companies, mainAr]) => {
        landPlots.push(...lands);
        companyPlots.push(...companies);
        mainAreas.push(...mainAr);

        renderBoard();
        // updatePlayer();
    });

    const getCoordinates = (position) => {
        if (position >= 0 && position < 11) return [boardSize - cellSize * (position + 1), boardSize - cellSize]; // bottom
        if (position >= 11 && position < 21) return [0, boardSize - cellSize * (position - 9)]; // left
        if (position >= 21 && position < 31) return [cellSize * (position - 20), 0]; // top
        if (position >= 31 && position < 40) return [boardSize - cellSize, cellSize * (position - 30)]; // right
        return [0, 0];
    }
    
    const  placeCell = (plot) => {
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
    
        const info = document.createElement("div");
        info.style.zIndex = "1"; // Щоб був поверх кольору
        info.innerHTML = `<strong>${plot.name || '#' + plot.position}</strong>`;
        if (plot.cost) info.innerHTML += `<br>💰 ${plot.cost}`;
        if (plot.rent) info.innerHTML += `<br>🏠 ${plot.rent}`;
        cell.appendChild(info);
    
        cell.dataset.index = plot.position;
        board.appendChild(cell);
        cells.push(cell);
    }

    const renderBoard = () => {
        landPlots.forEach(placeCell);
        companyPlots.forEach(placeCell);
        mainAreas.forEach(placeCell);
        // console.log(companyPlots);
    }

}





export default {
    buildMap
}