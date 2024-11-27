import { saveScoreToFirebase, getLeaderboardFromFirebase, clearLeaderboardInFirebase } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.querySelector(".game-board");
  const timerElement = document.getElementById("timer");
  const restartButton = document.getElementById("restart");
  const leaderboardList = document.getElementById("leaderboard");
  const nameModal = document.getElementById("name-modal");
  const playerNameInput = document.getElementById("player-name");
  const submitNameButton = document.getElementById("submit-name");
  const showLeaderboardButton = document.getElementById("show-leaderboard");
  const clearLeaderboardButton = document.getElementById("clear-leaderboard");
  
  let flippedCards = [];
  let isChecking = false;
  let matchedPairs = 0;
  let cardData = [];
  let timer = null;
  let startTime = null;
  let hasStarted = false;

  function updateLeaderboard() {
    document.getElementById("loading").classList.remove("hidden"); // 顯示載入
    getLeaderboardFromFirebase((data) => {
      document.getElementById("loading").classList.add("hidden"); // 完成後隱藏載入
  
      if (!Array.isArray(data)) {
        data = Object.values(data); // 如果是物件，轉換為陣列
      }
      if (data.length === 0) {
        console.error("No data to display on the leaderboard.");
        leaderboardList.innerHTML = "No players found.";
        return;
      }
  
      leaderboardList.innerHTML = ""; // 清空排行榜的內容
      data
        .sort((a, b) => a.time - b.time) // 排序
        .forEach((entry, index) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${index + 1}. ${entry.name} - ${entry.time.toFixed(2)} 秒`;
          leaderboardList.appendChild(listItem);
        });
  
      console.log("Sorted leaderboard data:", data);
      console.log("Updated Leaderboard HTML content:", leaderboardList.innerHTML);
    });
  
    console.log("UpdateLeaderboard function completed."); // 此處的 log 會先執行
    
  }
  
  

  function saveScore(name, time) {
    saveScoreToFirebase(name, time);
    updateLeaderboard();
  }

  submitNameButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      alert("請輸入有效的姓名！");
      return;
  }
    if (playerName) {
      const totalTime = parseFloat(timerElement.textContent.replace("遊戲時間：", "").replace("秒", "").trim());
      saveScore(playerName, totalTime);
      nameModal.classList.add("hidden");
      playerNameInput.value = "";
    }
  });

  showLeaderboardButton.addEventListener("click", () => {
    if (leaderboardList.style.display === "none" || leaderboardList.style.display === "") {
        leaderboardList.style.display = "block"; // 顯示排行榜
        showLeaderboardButton.textContent = "隱藏排行榜"; // 更新按鈕文字
    } else {
        leaderboardList.style.display = "none"; // 隱藏排行榜
        showLeaderboardButton.textContent = "顯示排行榜"; // 還原按鈕文字
    }
    updateLeaderboard(); // 每次點擊時更新排行榜
});

  

  clearLeaderboardButton.addEventListener("click", () => {
    if (confirm("確定要清除排行榜嗎？")) {
      clearLeaderboardInFirebase();
      updateLeaderboard();
    }
  });

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function generateCardData() {
    const data = [];
    for (let i = 1; i <= 10; i++) {
      data.push({ id: i, img: `images/front${i}.png` });
      data.push({ id: i, img: `images/front${i}.png` });
    }
    shuffle(data);
    return data;
  }

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

  function startTimer() {
    startTime = Date.now();
    timer = setInterval(() => {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      timerElement.textContent = `遊戲時間： ${elapsedTime} 秒`;
    }, 100);
  }

  function initGame() {
    flippedCards = [];
    isChecking = false;
    matchedPairs = 0;
    hasStarted = false;

    cardData = generateCardData();
    renderCards();
    addCardEventListeners();

    clearInterval(timer);
    timerElement.textContent = "遊戲時間： 0.00 秒";
  }

  function addCardEventListeners() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (isChecking || card.classList.contains("flipped") || flippedCards.length >= 2) return;

        if (!hasStarted) {
          hasStarted = true;
          startTimer();
        }

        card.classList.add("flipped");
        flippedCards.push(card);

        if (flippedCards.length === 2) {
          isChecking = true;
          const [card1, card2] = flippedCards;

          if (card1.dataset.id === card2.dataset.id) {
            matchedPairs++;
            flippedCards = [];
            isChecking = false;

            if (matchedPairs === 10) {
              clearInterval(timer);
              nameModal.classList.remove("hidden");
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

  restartButton.addEventListener("click", initGame);

  initGame();
});
