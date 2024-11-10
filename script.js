// DOM elements
const elements = {
  player: document.getElementById("player"),
  score: document.getElementById("score"), 
  level: document.getElementById("level"),
  bee: document.getElementById("bee"),
  gamePanel: document.getElementById("gamePanel"),
  registration: document.getElementById("registration"),
  inputName: document.getElementById("name"),
  start: document.getElementById("start"),
  flower: document.getElementById("flower"),
  playAgain: document.getElementById("playAgain"),
  startAgain: document.getElementById("startAgain"),
  closeBtn: document.getElementById("close")
};

// Game state
const gameState = {
  beeArray: [{
    name: elements.bee,
    bottom: [],
    left: [],
    rotate: []
  }],
  levels: {
    level: 1,
    interval: 400,
    minInterval: 50
  },
  count: 0,
  left: 0, 
  bottom: 0,
  gameInterval: null,
  direction: "right"
};

// Movement map
const movementMap = {
  right: {delta: 40, rotation: "0deg"},
  left: {delta: -40, rotation: "-180deg"},
  up: {delta: 40, rotation: "-90deg"},
  down: {delta: -40, rotation: "90deg"}
};

const startGame = () => {
  elements.registration.classList.remove("active");
  initializeFlowerPosition();
  levelChange();
};

const moveBee = () => {
  const movement = movementMap[gameState.direction];
  
  if (gameState.direction === "right" || gameState.direction === "left") {
    gameState.left += movement.delta;
  } else {
    gameState.bottom += movement.delta;
  }
  
  elements.bee.style.rotate = movement.rotation;

  if (isOutOfBounds()) {
    endGame();
    return;
  }

  updateBeePosition();
  checkCollision();
  updateBeeSegments();
};

const isOutOfBounds = () => {
  return gameState.left < 0 || 
         gameState.left >= elements.gamePanel.clientWidth ||
         gameState.bottom < 0 || 
         gameState.bottom >= elements.gamePanel.clientHeight;
};

const updateBeePosition = () => {
  elements.bee.style.left = `${gameState.left}px`;
  elements.bee.style.bottom = `${gameState.bottom}px`;
};

const updateBeeSegments = () => {
  for (let i = 0; i <= gameState.count; i++) {
    const segment = gameState.beeArray[i];
    segment.bottom.push(segment.name.style.bottom);
    segment.left.push(segment.name.style.left);
    segment.rotate.push(segment.name.style.rotate);

    if (i >= 1) {
      const prevSegment = gameState.beeArray[i - 1];
      segment.name.style.transition = elements.bee.style.transition;
      segment.name.style.bottom = prevSegment.bottom.at(i === 1 ? -2 : -1);
      segment.name.style.left = prevSegment.left.at(i === 1 ? -2 : -1);
      segment.name.style.rotate = prevSegment.rotate.at(i === 1 ? -2 : -1);

      if (hasCollisionWithHead(segment)) {
        endGame();
        return;
      }
    }
  }
};

const hasCollisionWithHead = (segment) => {
  return segment.name.style.bottom === elements.bee.style.bottom &&
         segment.name.style.left === elements.bee.style.left;
};

const endGame = () => {
  gameState.beeArray.forEach(segment => {
    if (segment.name !== elements.bee) {
      segment.name.remove();
    }
  });
  clearInterval(gameState.gameInterval);
  elements.playAgain.classList.add("active");
};

const beeLength = () => {
  const nextBee = document.createElement("div");
  nextBee.classList.add("bee");
  nextBee.innerHTML = elements.bee.innerHTML;
  
  const lastSegment = gameState.beeArray[gameState.count - 1];
  const newSegment = {
    name: nextBee,
    bottom: [lastSegment.bottom.at(-1)],
    left: [lastSegment.left.at(-1)],
    rotate: [lastSegment.rotate.at(-1)]
  };
  
  gameState.beeArray.push(newSegment);
  elements.gamePanel.append(newSegment.name);
};

const initializeFlowerPosition = () => {
  const x = Math.floor(Math.random() * (1280 / 40)) * 40;
  const y = Math.floor(Math.random() * (600 / 40)) * 40;
  elements.flower.style.left = `${x}px`;
  elements.flower.style.top = `${y}px`;
};

const levelChange = () => {
  const newLevelPoint = Math.ceil(gameState.count / 5);
  const { levels } = gameState;

  if (newLevelPoint > levels.level) {
    levels.level = newLevelPoint;
    levels.interval = Math.max(
      levels.minInterval,
      levels.interval - (levels.interval * 20) / 100
    );
  }

  clearInterval(gameState.gameInterval);
  gameState.gameInterval = setInterval(moveBee, levels.interval);
  elements.bee.style.transition = `all ${levels.interval}ms linear`;
  elements.level.textContent = `Level ${levels.level}`;
};

const checkCollision = () => {
  const beeRect = elements.bee.getBoundingClientRect();
  const flowerRect = elements.flower.getBoundingClientRect();
  
  if (hasIntersection(beeRect, flowerRect)) {
    elements.score.textContent = ++gameState.count;
    initializeFlowerPosition();
    levelChange();
    beeLength();
  }
};

const hasIntersection = (rect1, rect2) => {
  return rect1.left < rect2.right &&
         rect1.right > rect2.left &&
         rect1.top < rect2.bottom &&
         rect1.bottom > rect2.top;
};

const reset = () => {
  Object.assign(gameState, {
    count: 0,
    left: 0,
    bottom: 0,
    direction: "right"
  });
  
  gameState.levels.level = 1;
  gameState.levels.interval = 400;
  
  gameState.beeArray.length = 1;
  Object.assign(gameState.beeArray[0], {
    name: elements.bee,
    bottom: [],
    left: [],
    rotate: []
  });
  
  elements.score.textContent = gameState.count;
};

// Event Listeners
window.addEventListener("keydown", (e) => {
  const { direction, left, bottom } = gameState;
  const { gamePanel } = elements;
  
  if (e.key === "ArrowDown" && bottom > 0) {
    gameState.direction = "down";
  } else if (e.key === "ArrowUp" && bottom < gamePanel.clientHeight) {
    gameState.direction = "up";
  } else if (e.key === "ArrowRight" && left < gamePanel.clientWidth) {
    gameState.direction = "right";
  } else if (e.key === "ArrowLeft" && left > 0) {
    gameState.direction = "left";
  }
});

elements.start.addEventListener("click", () => {
  elements.player.textContent = elements.inputName.value;
  startGame();
});

elements.inputName.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    elements.player.textContent = elements.inputName.value;
    startGame();
  }
});

elements.startAgain.onclick = () => {
  elements.playAgain.classList.remove("active");
  reset();
  initializeFlowerPosition();
  levelChange();
};

elements.closeBtn.onclick = () => window.close();

// Initial setup
initializeFlowerPosition();
