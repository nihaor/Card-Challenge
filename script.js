document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.querySelector(".game-board");
  const scoreElement = document.getElementById("score");
  const timerElement = document.getElementById("timer");
  const restartButton = document.getElementById("restart");

  // 音效設定
  const flipSound = new Audio("sounds/flip.mp3");
  const matchSound = new Audio("sounds/match.mp3");
  const gameOverSound = new Audio("sounds/gameover.mp3");
  const winSound = new Audio("sounds/win.mp3");

  // 遊戲狀態變數
  let flippedCards = [];
  let isChecking = false; // 判斷是否正在檢查卡片
  let score = 0; // 玩家分數
  let matchedPairs = 0; // 已配對成功的卡片數
  let cardData = []; // 存放卡片數據的陣列
  let timer = null; // 計時器
  let timeLeft = 60; // 時間限制（秒）
  let hasStarted = false; // 判斷遊戲是否已開始

  /**
   * 隨機打亂陣列
   * @param {Array} array - 要打亂的陣列
   */
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * 生成卡牌數據
   * 每組圖案生成兩張卡片
   * @returns {Array} 卡片數據陣列
   */
  function generateCardData() {
    const data = [];
    for (let i = 1; i <= 10; i++) {
      data.push({ id: i, img: `images/front${i}.png` });
      data.push({ id: i, img: `images/front${i}.png` });
    }
    shuffle(data); // 打亂卡片順序
    return data;
  }

  /**
   * 渲染卡片到遊戲區域
   */
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

  /**
   * 初始化遊戲
   */
  function initGame() {
    flippedCards = [];
    isChecking = false;
    score = 0;
    matchedPairs = 0;
    hasStarted = false;
    scoreElement.textContent = score;

    cardData = generateCardData();
    renderCards();
    addCardEventListeners();

    clearInterval(timer); // 清除舊計時器
    timeLeft = 60; // 重置時間
    timerElement.textContent = timeLeft;
  }

  /**
   * 開始計時
   */
  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      timerElement.textContent = timeLeft;

      if (timeLeft === 0) {
        clearInterval(timer);
        gameOverSound.play();
        alert("可惜了! 等等可以再邀朋友來挑戰看看!!");
        disableAllCards(); // 禁用所有卡片
      }
    }, 1000);
  }

  /**
   * 禁用所有卡片
   */
  function disableAllCards() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.style.pointerEvents = "none";
    });
  }

  /**
   * 為卡片添加點擊事件邏輯
   */
  function addCardEventListeners() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (isChecking || card.classList.contains("flipped")) return;

        if (!hasStarted) {
          hasStarted = true;
          startTimer();
        }

        flipSound.play();
        card.classList.add("flipped");
        flippedCards.push(card);

        if (flippedCards.length === 2) {
          isChecking = true;
          const [card1, card2] = flippedCards;

          if (card1.dataset.id === card2.dataset.id) {
            score += 10;
            matchedPairs++;
            scoreElement.textContent = score;
            matchSound.play();

            flippedCards = [];
            isChecking = false;

            if (matchedPairs === 10) {
              clearInterval(timer);
              winSound.play();
              setTimeout(() => {
                alert(`你好厲害!成功認出所有洗滌標籤，得分：${score}`);
              }, 500);
            }
          } else {
            setTimeout(() => {
              card1.classList.remove("flipped");
              card2.classList.remove("flipped");
              flippedCards = [];
              isChecking = false;
            }, 350);
          }
        }
      });
    });
  }

  // 重新開始按鈕邏輯
  restartButton.addEventListener("click", () => {
    clearInterval(timer);
    initGame();
  });

  initGame(); // 初始化遊戲
});
