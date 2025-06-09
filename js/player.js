const totalCells = 40;
let playerPosition = 0;


const status = document.getElementById("status");
const rollBtn = document.getElementById("roll");




function updatePlayer() {
document.querySelectorAll(".player").forEach(el => el.remove());
const currentCell = document.querySelector(`.cell[data-index='${playerPosition}']`);
// console.log("currentCell: ", currentCell)
if (currentCell) {
    const player = document.createElement("div");
    player.className = "player";
    currentCell.appendChild(player);
}
}

rollBtn.onclick = () => {
const dice = Math.ceil(Math.random() * 12);
status.textContent = `You rolled a ${dice}`;
playerPosition = (playerPosition + dice) % totalCells;
updatePlayer();

};

const startPosition = () => {
const player = document.createElement("div");
    const startCell = document.querySelector(`.cell[data-index='${0}']`);
    console.log('startCell: ', startCell)
player.className = "player";
startCell.appendChild(player);

}



export default {
    startPosition,
    updatePlayer
}