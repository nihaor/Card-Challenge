document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.querySelector(".game-board");
  const timerElement = document.getElementById("timer");
  const restartButton = document.getElementById("restart");
  const leaderboardContainer = document.getElementById("leaderboard-container");
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
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboardList.innerHTML = "";

    leaderboard
      .sort((a, b) => a.time - b.time)
      .forEach((entry, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${entry.name} - ${entry.time} 秒`;
        leaderboardList.appendChild(listItem);
      });
  }

  function saveScore(name, time) {
    if (!name || isNaN(time)) {
      console.error("Invalid score data:", { name, time });
      return;
    }
  
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, time });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    updateLeaderboard();
  }

  submitNameButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
      const totalTime = parseFloat(timerElement.textContent);
      saveScore(playerName, totalTime);
      nameModal.classList.add("hidden");
      playerNameInput.value = "";
    }
  });

  showLeaderboardButton.addEventListener("click", () => {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.classList.toggle("hidden");
    leaderboard.style.display = leaderboard.style.display === "none" || !leaderboard.style.display ? "block" : "none";
    updateLeaderboard();
  });

  clearLeaderboardButton.addEventListener("click", () => {
    if (confirm("確定要清除排行榜嗎？")) {
      localStorage.removeItem("leaderboard");
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
