//запис логів на сторінку в елемент <p> з id="log"
const logAction = (text) => {
  const log = document.getElementById("log");
  const p = document.createElement("p");
  p.innerHTML = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight; // автоматичне прокручування вниз
}

const activPlayerColor = (color) => {
  const border = document.getElementById("containerNav");
  border.style.border = `10px solid ${color}`;
};

export { logAction, activPlayerColor };
  