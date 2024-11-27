// firebase.js

// Firebase SDK 初始化
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyB6X3JL3nv4r5pDMbEuxGIIsujPtu34sG4",
  authDomain: "memorycardgame-17481.firebaseapp.com",
  databaseURL: "https://memorycardgame-17481-default-rtdb.firebaseio.com/",
  projectId: "memorycardgame-17481",
  storageBucket: "memorycardgame-17481.firebasestorage.app",
  messagingSenderId: "888326648172",
  appId: "1:888326648172:web:9ab0c7c7c6295ccb964349",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
console.log("Firebase app initialized:", app.name); // 應該打印出 "Firebase app initialized: [DEFAULT]"


// 寫入資料到排行榜
export function saveScoreToFirebase(name, time) {
  const leaderboardRef = ref(db, "leaderboard");
  const newEntryRef = push(leaderboardRef);
  set(newEntryRef, { name, time });
}

// 取得排行榜資料
export function getLeaderboardFromFirebase(callback) {
    const leaderboardRef = ref(db, "leaderboard");
    onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched leaderboard data:", data); // 測試 Firebase 是否返回數據
      callback(data ? Object.values(data) : []);
    }, (error) => {
      console.error("Error fetching leaderboard:", error); // 打印錯誤信息
    });
  }

// 清除排行榜資料
export function clearLeaderboardInFirebase() {
  const leaderboardRef = ref(db, "leaderboard");
  remove(leaderboardRef);
}

