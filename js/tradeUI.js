import { playerMain } from "./playerMove.js";


export function tradeUI(player, players) {

  const tradeBtn = document.getElementById("open-trade-btn"); // 🔹 Кнопка для відкриття ринкової модалки

  initTradeModal(); // Ініціалізуємо модалку при завантаженні сторінки

  if (tradeBtn) {  
    tradeBtn.addEventListener("click", () =>  onTradeButtonClick(player, players)); // Додаємо обробник кліку для відкриття ринкової модалки
  }

  
}

 // Функція обробника кліку на кнопку відкриття ринкової модалки
const onTradeButtonClick = (player, players) => {

  //console.log("Відкриваємо ринкову модалку для гравця:", player); // Виводимо в консоль ім'я гравця, для якого відкривається модалка
 
  const currentPlayerNameElem = document.getElementById("trade-player"); // Елемент для відображення імені поточного гравця в заголовку модалки
  

  if (currentPlayerNameElem) {
    currentPlayerNameElem.innerText = `${playerMain.getCurrentPlayer().emoji} ${playerMain.getCurrentPlayer().name}`; // Встановлюємо ім'я поточного гравця в заголовок модалки
  }
  setupSelectOptions(players); // Заповнюємо селект з гравцями для вибору партнера по торгівлі
      // Відкриваємо модалку торгівлі
      openTradeModalTest(); // FOR TEST, потім замінити на реальну функцію відкриття модалки з логікою завантаження даних гравця та пропозицій торгівлі
};


// Функція для заповнення селекту з гравцями, з якими можна торгувати
const setupSelectOptions = (players) => { 

const listPleyers = document.getElementById("trade-target-player-select"); // Селект для вибору гравця, з яким хочемо торгувати

  listPleyers.innerHTML = `
  <option value="" disabled selected>Оберіть гравця...</option>
`; // Очищаємо попередні опції та додаємо першу опцію з підказкою
  
players.forEach((player) => {
  const option = document.createElement("option");
  option.value = player.id;
  option.textContent = player.name === playerMain.getCurrentPlayer().name ? `${player.emoji} ${player.name} (ви)` : `${player.emoji} ${player.name}`  ;
  listPleyers.appendChild(option);
});
}


// Ініціалізація ринкової модалки та додавання обробників подій для закриття   
export function initTradeModal() {
  const overlay = document.getElementById("trade-modal-overlay");
  const closeBtn = document.getElementById("trade-close-icon");
  const cancelBtn = document.getElementById("trade-cancel-btn");

  // Функція для закриття модалки
  const closeModal = () => {
    overlay.classList.add("trade-hidden");
    // Тут потім будемо скидати всі чекбокси та поля вводу
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Закриття при кліку на темний фон (поза вікном)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
}

// Тестовий виклик для перевірки візуалу
export function openTradeModalTest() {
  const overlay = document.getElementById("trade-modal-overlay");
  overlay.classList.remove("trade-hidden");
}
