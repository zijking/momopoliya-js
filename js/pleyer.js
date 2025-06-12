class Player {
    constructor(name, emoji = '🐭') {
        this.id = Date.now() + Math.floor(Math.random() * 1000); // Унікальний ID
        this.name = name;
        this.emoji = emoji;
        this.position = 0;
        this.balance = 1500;
        this.properties = [];
        this.inJail = false;
    }

    move(steps) {
        this.position = (this.position + steps) % 40;
    }

    updateBalance(amount) {
        this.balance += amount;
    }

    addProperty(property) {
        this.properties.push(property);
    }

    pay(amount, receiver = null) {
        if (this.balance >= amount) {
            this.balance -= amount;
            if (receiver) receiver.updateBalance(amount);
            return true;
        } else {
            alert(`${this.name} не має достатньо коштів!`);
            return false;
        }
    }
}

export default Player;