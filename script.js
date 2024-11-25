document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.querySelector(".game-board");
  const scoreElement = document.getElementById("score");
  const timerElement = document.getElementById("timer");
  const restartButton = document.getElementById("restart");
  const toggleLeaderboardButton = document.getElementById("toggle-leaderboard");
  const leaderboardContainer = document.getElementById("leaderboard-container");
  const leaderboardList = document.getElementById("leaderboard");

  // 音效設定
  const flipSound = new Audio("sounds/flip.mp3");
  const matchSound = new Audio("sounds/match.mp3");
  const gameOverSound = new Audio("sounds/gameover.mp3");
  const winSound = new Audio("sounds/win.mp3");

  // 遊戲狀態變數
  let flippedCards = [];
  let isChecking = false;
  let score = 0;
  let matchedPairs = 0;
  let cardData = [];
  let timer = null;
  let timeLeft = 60;
  let hasStarted = false;
  let timerStarted = false;

  // 排行榜數據
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

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
    shuffle(data);
    return data;
  }

  /**
   * 渲染卡片到遊戲區域
   */
  function renderCards() {
    gameBoard.innerHTML = "";
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
    timerStarted = false;
    scoreElement.textContent = score;

    cardData = generateCardData();
    renderCards();
    addCardEventListeners();

    clearInterval(timer); // 清除舊計時器
    timeLeft = 60; // 重置時間
    timerElement.textContent = timeLeft;
  }

  /**
   * 開始計時器
   */
  function startTimer() {
    timerStarted = true;
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        timerElement.textContent = timeLeft;
      } else {
        clearInterval(timer);
        endGame("時間到！");
      }
    }, 1000);
  }

  /**
   * 結束遊戲並輸入名字
   * @param {string} message - 顯示的訊息
   */
  function endGame(message) {
    clearInterval(timer);
    alert(`${message} 您的得分是：${score}`);
    const playerName = prompt("請輸入您的名字：", "玩家");
    if (playerName) {
      leaderboard.push({ name: playerName, score });
      leaderboard.sort((a, b) => b.score - a.score); // 依分數由高到低排序
      localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
      updateLeaderboard();
    }
  }

  /**
   * 更新排行榜顯示
   */
  function updateLeaderboard() {
    leaderboardList.innerHTML = "";
    leaderboard.forEach((entry, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${index + 1}. ${entry.name} - ${entry.score} 分`;
      leaderboardList.appendChild(listItem);
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

        if (!timerStarted) {
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
              winSound.play();
              endGame("恭喜你成功配對！");
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

  toggleLeaderboardButton.addEventListener("click", () => {
    leaderboardContainer.classList.toggle("hidden");
    toggleLeaderboardButton.textContent = leaderboardContainer.classList.contains("hidden")
      ? "顯示排行榜"
      : "隱藏排行榜";
  });

  restartButton.addEventListener("click", initGame);

  initGame();
  updateLeaderboard();
});
