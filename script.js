document.addEventListener("DOMContentLoaded", () => {
  // DOM 元素選取
  const gameBoard = document.querySelector(".game-board");
  const timerElement = document.getElementById("timer");
  const restartButton = document.getElementById("restart");

  // 音效設定
  const flipSound = new Audio("sounds/flip.mp3");
  const matchSound = new Audio("sounds/match.mp3");
  const winSound = new Audio("sounds/win.mp3");
  const backgroundMusic = new Audio("sounds/background.mp3");
  backgroundMusic.loop = true;

  // 遊戲狀態變數
  let flippedCards = [];
  let isChecking = false;
  let matchedPairs = 0;
  let cardData = [];
  let timer = null;
  let startTime = null;
  let hasStarted = false;

  // ===== 遊戲功能 =====
  // 洗牌函數
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // 生成卡片數據
  function generateCardData() {
    const data = [];
    for (let i = 1; i <= 10; i++) {
      data.push({ id: i, img: `images/front${i}.png` });
      data.push({ id: i, img: `images/front${i}.png` });
    }
    shuffle(data);
    return data;
  }

  // 渲染卡片
  function renderCards() {
    gameBoard.innerHTML = ""; // 清空遊戲區域
    cardData.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.dataset.id = card.id;
      cardElement.innerHTML = `
        <div class="front">
          <img src="${card.img}" alt="Card ${card.id}" />
        </div>
        <div class="back">
          <img src="images/back.png" alt="Back" />
        </div>
      `;
      gameBoard.appendChild(cardElement);
    });
  }

  // 初始化遊戲
  function initGame() {
    flippedCards = [];
    isChecking = false;
    matchedPairs = 0;
    hasStarted = false;

    cardData = generateCardData();
    renderCards();
    addCardEventListeners();

    clearInterval(timer);
    timerElement.textContent = "0.00 秒";
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }

  // 計時功能
  function startTimer() {
    startTime = Date.now();
    timer = setInterval(() => {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      timerElement.textContent = `${elapsedTime} 秒`;
    }, 100);
  }

  // 結束遊戲
  function endGame(message) {
    clearInterval(timer);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    alert(`${message} 完成時間：${totalTime} 秒`);
  }

  // 添加卡片點擊事件
  function addCardEventListeners() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (isChecking || card.classList.contains("flipped")) return;

        if (!hasStarted) {
          hasStarted = true;
          startTimer();
          backgroundMusic.play();
        }

        flipSound.play();
        card.classList.add("flipped");
        flippedCards.push(card);

        if (flippedCards.length === 2) {
          isChecking = true;
          const [card1, card2] = flippedCards;

          if (card1.dataset.id === card2.dataset.id) {
            matchedPairs++;
            matchSound.play();
            flippedCards = [];
            isChecking = false;

            if (matchedPairs === 10) {
              winSound.play();
              endGame("恭喜完成挑戰！");
            }
          } else {
            setTimeout(() => {
              card1.classList.remove("flipped");
              card2.classList.remove("flipped");
              flippedCards = [];
              isChecking = false;
            }, 500);
          }
        }
      });
    });
  }

  // ===== 事件綁定 =====
  restartButton.addEventListener("click", initGame);

  // ===== 初始化 =====
  initGame();
});
