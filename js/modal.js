// modal.js — модуль для роботи з модальним вікном

/**
 * Показати модальне вікно з текстом і однією кнопкою OK
 * @param {string} message - HTML-повідомлення
 * @param {Function} [callback] - Що робити після натискання OK
 */
export function showModal(message, callback) {
    const modal = document.getElementById('modal');
    const msgBox = document.getElementById('modal-message');
    const btnBox = document.getElementById('modal-buttons');
  
    msgBox.innerHTML = message;
    btnBox.innerHTML = '';
  
    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.onclick = () => {
      modal.classList.add('hidden');
      if (typeof callback === 'function') callback();
    };
  
    btnBox.appendChild(okBtn);
    modal.classList.remove('hidden');
  }
  
  /**
   * Показати модальне вікно з кількома кнопками вибору
   * @param {string} message - HTML-повідомлення
   * @param {Array<{label: string, onClick: Function}>} choices - Кнопки з діями
   */
  export function showModalWithChoices(message, choices = []) {
    const modal = document.getElementById('modal');
    const msgBox = document.getElementById('modal-message');
    const btnBox = document.getElementById('modal-buttons');
  
    msgBox.innerHTML = message;
    btnBox.innerHTML = '';
  
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice.label;
      btn.onclick = () => {
        modal.classList.add('hidden');
        if (typeof choice.onClick === 'function') {
          choice.onClick();
        }
      };
      btnBox.appendChild(btn);
    });
  
    modal.classList.remove('hidden');
  }
  