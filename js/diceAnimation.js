// Зберігаємо інстанс Kaboom глобально для цього модуля, щоб не створювати його щоразу
let kInstance = null;

export function playDiceRollAnimation(target1, target2) {
  return new Promise((resolve) => {
    let overlay = document.getElementById("dice-overlay");

    // 1. Якщо оверлею немає — створюємо його
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "dice-overlay";
      overlay.style =
        "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 300px; z-index: 9999; pointer-events: none;";
      overlay.innerHTML =
        '<canvas id="kaboom-dice-canvas" style="width:100%; height:100%;"></canvas>';
      document.body.appendChild(overlay);
    }

    overlay.style.display = "block";
    const canvas = document.getElementById("kaboom-dice-canvas");

    // 2. Ініціалізуємо Kaboom ОДИН раз за весь час роботи програми
    if (!kInstance) {
      kInstance = kaboom({
        canvas: canvas,
        width: 400,
        height: 300,
        background: [0, 0, 0, 0], // Прозорий фон
        global: false,
      });
    }

    const k = kInstance;

    // Очищаємо все, що залишилося від попереднього кидка, замість k.quit()
    k.destroyAll();

    // 3. Функція створення кубика
    function createDie(x, y, finalValue) {
      const die = k.add([
        k.rect(60, 60, { radius: 8 }),
        k.pos(x, y),
        k.color(255, 255, 255),
        k.outline(4, k.rgb(252, 248, 8)),
        k.area(),             // 1. ДОДАНО: реєструємо хитбокс для зіткнень
        k.anchor("center"),
        k.rotate(k.rand(0, 360)),
        "die",                // 2. ДОДАНО: тег для відстеження колізій між кубиками
        {
          velX: k.rand(-250, 250),
          velY: k.rand(-150, -350),
          rotSpeed: k.rand(400, 800),
          gravity: 1000,
          isSettled: false,
          finalVal: finalValue,
        },
      ]);

      const textLabel = die.add([
        k.text(k.randi(1, 7).toString(), { size: 32 }),
        k.color(0, 0, 0),
        k.anchor("center"),
      ]);

        die.onUpdate(() => {
            if (die.isSettled) return;

            die.velY += die.gravity * k.dt();
            die.pos.x += die.velX * k.dt();
            die.pos.y += die.velY * k.dt();
            die.angle += die.rotSpeed * k.dt();

            if (k.chance(0.15)) {
                textLabel.text = k.randi(1, 7).toString();
            }

            if (die.pos.y > 230) {
                die.pos.y = 230;
                die.velY = -die.velY * 0.55;
                die.velX *= 0.75;
                die.rotSpeed *= 0.6;

                if (Math.abs(die.velY) < 40 && Math.abs(die.velX) < 40) {
                    die.isSettled = true;
                    die.angle = 0;
                    textLabel.text = die.finalVal.toString();
            
                    // Захист на випадок, якщо один кубик застиг, а другий його штовхнув:
                    // зсуваємо трохи вбік за необхідності, щоб вони візуально не перекривались
                }
            }

            if (die.pos.x < 40) {
                die.pos.x = 40;
                die.velX = -die.velX;
            }
            if (die.pos.x > 360) {
                die.pos.x = 360;
                die.velX = -die.velX;
            }
        });
    }

    // 3. ДОДАНО: Обробка зіткнення кубиків між собою
    k.onCollide("die", "die", (die1, die2) => {
      // Пружний відскок по осі X
      const tempVelX = die1.velX;
      die1.velX = die2.velX;
      die2.velX = tempVelX;

      // Пружний відскок по осі Y
      const tempVelY = die1.velY;
      die1.velY = die2.velY;
      die2.velY = tempVelY;

      // Додатково розштовхуємо їх на 1 піксель, щоб вони не застрягли один в одному
      const dir = die2.pos.sub(die1.pos).unit();
      if (!die1.isSettled) die1.pos = die1.pos.sub(dir);
      if (!die2.isSettled) die2.pos = die2.pos.add(dir);

      // Якщо один із кубиків уже зупинився, зіткнення знову активує рух,
      // або змусить посунутись, щоб звільнити місце
      if (die1.isSettled && !die2.isSettled) {
        die1.pos.x -= 20 * Math.sign(dir.x);
      }
      if (die2.isSettled && !die1.isSettled) {
        die2.pos.x += 20 * Math.sign(dir.x);
      }
    });

    // Запускаємо кубики (змінив початковий X, щоб вони летіли назустріч один одному)
    createDie(100, 150, target1);
    createDie(300, 150, target2);

    // 4. Замість повного знищення рушія, просто ховаємо інтерфейс
    k.wait(2.2, () => {
      k.destroyAll(); // Прибираємо кубики з екрана
      overlay.style.display = "none"; // Ховаємо конвас
      resolve(); // Продовжуємо логіку гри Монополія
    });
  });
}