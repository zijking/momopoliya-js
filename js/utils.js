const  logAction = (text) => {
    const log = document.getElementById('log');
    const p = document.createElement('p');
    p.innerHTML = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight; // автоматичне прокручування вниз
}
  
export  {
  logAction
};
  