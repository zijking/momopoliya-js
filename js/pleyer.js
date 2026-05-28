class Player {
  constructor(name, emoji = "🐭", color = "") {
    this.id = Date.now() + Math.floor(Math.random() * 1000); // Унікальний ID
    this.name = name;
    this.emoji = emoji;
    this.position = 0;
    this.balance = 1500;
    this.properties = [];
    this.inJail = false;
    this.jailTurns = 0;
    this.jailFree = 0; // Кількість карток "Вийти з в'язниці безкоштовно"
    this.doublesCount = 0;
    this.color = color; // Колір гравця для UI
  }

  move(steps) {
    this.position = (this.position + steps) % 40;
  }

  updateBalance(amount) {
    this.balance += amount;
    console.log(`${this.emoji}${this.name} тепер має ${this.balance} монет.`); //Лог БАЛАНСУ
  }

  addProperty(property) {
    this.properties.push(property);
  }

  pay(amount, receiver = null) {
    if (this.balance >= amount) {
      this.balance -= amount;
      if (receiver) receiver.updateBalance(+amount);
      return true;
    } else {
      alert(`${this.name} не має достатньо коштів!`);
      return false;
    }
  }
}

export default Player;
