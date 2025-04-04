import { showLoadingScreen, showResultScreen, showUploadScreen } from "./main.js";
import { showTab } from "./resultsInit.js";

// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

const uploadTile = document.getElementById('uploadTile');

const loadedImageDiv = document.getElementById('loadedimage');
const repColors = document.getElementById('rep-colors');
const histogramDiv = document.getElementById('histogram');
const histogramDescription = document.getElementById('histogram-description');
const heatmapDiv = document.getElementById('heatmap');
const heatmapDescription = document.getElementById('heatmap-description');
const backgroundRemovalDiv = document.getElementById('backgroundRemoval');
const toggleSwitch1 = document.getElementById('toggle_switch1');
const toggleSwitch2 = document.getElementById('toggle_switch2');

let docRefId = null;

const firebaseConfig = {
  apiKey: "AIzaSyA-wjt8D4zYzLhj6HEeLRqjSDWmTrBku70",
  authDomain: "artisanallyproject.firebaseapp.com",
  projectId: "artisanallyproject",
  storageBucket: "artisanallyproject.firebasestorage.app",
  messagingSenderId: "471591578999",
  appId: "1:471591578999:web:4b37ca262aa514c91f8572"
};
if (!firebase.apps.length) { //多重初期化を防ぐ
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const collectionName = 'rooms';
const subcollectionName = "chat_history";
let unsubscribe = null;
let unsubscribeChat = null;

export let originalImageUrl = null;

// ドラッグ中の動作
uploadTile.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = '#e0e0e0';
});

// ドラッグが離れた時の動作
uploadTile.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = '';
});

// ドロップされた時の動作
uploadTile.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageUpload(file);
  } else {
    alert('画像ファイルをドロップしてください。');
  }
});

// 画像がアップロードされた時の処理
async function handleImageUpload(file) {
  showLoadingScreen();
  try {
    const jsonData = await getJsonData(file);
    let docId = null;
    if (window.location.origin.includes("localhost")) {
      docId = "470f9aaa-77d0-449c-b3db-29d9d7ea8e76";
    } else {
      docId = await sendImageToApi(jsonData);
    }
    docRefId = docId;
    const firestoreDoc = await getFirestoreDoc(docId);
    displayImageData(firestoreDoc);
    showResultScreen();
    showTab('tabpage1');
    setupRealtimeListener(docId);
    if (!window.location.origin.includes("localhost")) {
      await callAPIs(docId);
    }
  } catch (error) {
    console.error("Error processing image:", error);
    // alert("Error: " + error.message);
    showUploadScreen();
  }
}

// fileからjsonデータを整形する
function getJsonData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const ImageSrc = reader.result;
      const resultList = ImageSrc.split(",");
      const base64data = resultList[resultList.length - 1];
      resolve({
        image: base64data,
        image_type: file.type.split("/")[1]
      })
    };
    reader.onerror = error => reject(error);
  });
}

// Base64エンコードされた画像をAPIに送信、firestoreのIDを得る
async function sendImageToApi(jsonData) {
  try {
    const response = await fetch('/upload/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();

    if (data && data.room_id) {
      console.log("Received ID:", data.room_id);
      return data.room_id;
    } else {
      throw new Error("Invalid response format: 'id' property missing.");
    }

  } catch (error) {
    console.error("Error sending image:", error);
    throw error;
  }
}

// 複数のAPIを叩く
async function callAPIs(docId) {
  const endPointList = [
    "/main_commentary/",
    "/histogram_commentary/",
    "/background_removal/",
    "/heatmap/"
  ];
  for (const endPoint of endPointList) {
    try {
      const response = await fetch(endPoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "room_id": docId,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      console.error("Error sending image:", error);
      throw error;
    }
  }
}


function getRepColors(rep_colors) {
  const result = [];
  for (const value of rep_colors) {
    const r = value.r.toString(16).padStart(2, '0');
    const g = value.g.toString(16).padStart(2, '0');
    const b = value.b.toString(16).padStart(2, '0');
    const hexCode = "#" + r + g + b;
    result.push(hexCode);
  }
  return result;
}

// firestoreのデータを取得
async function getFirestoreDoc(docId) {
  try {
    const docSnapshot = await db.collection(collectionName).doc(docId).get();
    if (!docSnapshot.exists) {
      throw new Error("Firestore document not found.");
    }
    let data = docSnapshot.data();
    const subCollectionRef = db.collection(collectionName)
      .doc(docId).collection(subcollectionName);
    const querySnapshot = await subCollectionRef.get();
    data[subcollectionName] = {}
    for (const doc of querySnapshot.docs) {
      data[subcollectionName][doc.id] = doc.data();
      data[subcollectionName][doc.id]["id"] = doc.id;
    }
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch Firestore data: ${error.message}`);
  }
}


function setupRealtimeListener(docId) {
  // 以前のリスナーがあれば解除
  if (unsubscribe) {
    unsubscribe();
  }
  const subCollectionRef = db.collection(collectionName)
    .doc(docId).collection(subcollectionName);
  unsubscribe = db.collection(collectionName).doc(docId)
    .onSnapshot((docSnapshot) => {
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        subCollectionRef.get().then((querySnapshot) => {
            data[subcollectionName] = {}
            for (const doc of querySnapshot.docs) {
              data[subcollectionName][doc.id] = doc.data();
            }
          })
        displayImageData(data);
        onDataChanged(data);
      } else {
        console.log("Document does not exist (anymore).");
      }
    }, (error) => {
      console.error("Error in realtime listener:", error);
    });
  if (unsubscribeChat) {
    unsubscribeChat();
  }
  unsubscribeChat = subCollectionRef.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      getFirestoreDoc(docId)
        .then(data => {
          displayImageData(data);
          onDataChanged(data);
        });
      console.log("New document added: ", change.doc.data());
    });
  }, (error) => {
    console.error("Error listening for changes: ", error);
    // エラーハンドリング (再接続など)
  });
}

function initColorsTab(firestoreDoc) {
  repColors.innerHTML = "";
  const rep_colors = getRepColors(firestoreDoc.rep_colors);
  for (const color in rep_colors) {
    // 丸い背景色のみの小さな要素を複数配置する
    const dropTile = document.createElement('div');
    dropTile.id = color;
    dropTile.className = 'drop-tile';
    // 背景色にcolorを追加
    dropTile.style.backgroundColor = rep_colors[color];
    repColors.appendChild(dropTile);
  }
  return rep_colors[0];
}

function setChatMsg(firestoreDoc) {
  const msgList = [];
  for (const [_, value] of Object.entries(firestoreDoc.chat_history)) {
    msgList.push(value)
  }
  msgList.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateA - dateB;
  });
  const existingMessageIds = new Set();
  const oldMessages = document.getElementsByClassName("message");
  for (const message of oldMessages) {
    existingMessageIds.add(message.id);
  }
  for (const msg of msgList) {
    if (existingMessageIds.has(msg.id)) {
      continue;
    }
    addMessageToChat(msg.text, msg.sender, msg.id);
  }
}

// 各種情報を配置
function displayImageData(firestoreDoc) {
  console.log(firestoreDoc);

  const bucketName = firestoreDoc.bucket_name;
  const storageBaseURL = `https://storage.googleapis.com/${bucketName}/images/`

  // アップロードされた画像を表示
  if ("original_image_name" in firestoreDoc) {
    // タブ1を設定 カラー
    let mainColor = null
    if ("rep_colors" in firestoreDoc) {
      mainColor = initColorsTab(firestoreDoc);
    }
    const originalImageName = firestoreDoc.original_image_name;
    originalImageUrl = storageBaseURL + originalImageName;
    const img = document.createElement('img');
    img.src = originalImageUrl;
    img.id = "originalImage";
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    if (mainColor !== null) {
      loadedImageDiv.style.backgroundColor = mainColor;
    } else {
      loadedImageDiv.style.backgroundColor = "#fff";
    }
    loadedImageDiv.innerHTML = '';
    loadedImageDiv.appendChild(img);
  }

  // タブ2を設定 ヒストグラム
  if (
    "histogram_image_name" in firestoreDoc &&
    firestoreDoc.histogram_image_name !== null
  ) {
    const histogramImageName = firestoreDoc.histogram_image_name;
    const histogramImageUrl = storageBaseURL + histogramImageName;
    histogramDiv.innerHTML = `<img src="${histogramImageUrl}" alt="Histogram">`;
  }
  if (
    "histogram_commentary" in firestoreDoc &&
    firestoreDoc.histogram_commentary !== null
  ) {
    histogramDescription.textContent = firestoreDoc.histogram_commentary;
  }

  // タブ3を設定 ヒートマップ
  if (
    "heatmap_image_name" in firestoreDoc &&
    firestoreDoc.heatmap_image_name !== null
  ) {
    const heatmapImageName = firestoreDoc.heatmap_image_name;
    const heatmapImageUrl = storageBaseURL + heatmapImageName;
    toggleSwitch1.checked = false;
    heatmapDiv.innerHTML = `<img src="${heatmapImageUrl}" alt="Heatmap" id="heatmapImage">`;
  }
  if (
    "heatmap_commentary" in firestoreDoc &&
    firestoreDoc.heatmap_commentary !== null
  ) {
    heatmapDescription.textContent = firestoreDoc.heatmap_commentary;
  }

  // タブ4を設定 バックグランドリムーバル
  if (
    "back_removed_image_name" in firestoreDoc &&
    firestoreDoc.back_removed_image_name !== null
  ) {
    const backgroundRemovalImageName = firestoreDoc.back_removed_image_name;
    const backgroundRemovalImageUrl = storageBaseURL + backgroundRemovalImageName;
    toggleSwitch2.checked = false;
    backgroundRemovalDiv.innerHTML = `<img src="${backgroundRemovalImageUrl}" alt="Heatmap" id="backgroundRemovalImage">`;
  }

  // AIチャットをチャット欄に乗っける
  if (
    "chat_history" in firestoreDoc &&
    firestoreDoc.chat_history !== null
  ) {
    setChatMsg(firestoreDoc);
  }
}

// データ変更確認
function onDataChanged(data) {
  console.log("Data changed:", data);
}

// aiChat ===========

const messageBox = document.getElementById('messageBox');
const inputMsg = document.getElementById('inputMsg');
const sendBtn = document.getElementById('sendBtn');

// メッセージの送信処理
sendBtn.addEventListener('click', async () => {
  const message = inputMsg.value.trim();
  if (!message) return;
  inputMsg.value = '';
  // addMessageToChat(message, 'user');
  try{
    const aiResponse = await getAiResponse(message);
    // addMessageToChat(aiResponse, 'ai');
  } catch (error) {
    console.error("Error getting AI response:", error);
    // addMessageToChat("エラーが発生しました。", "ai");
  }
});

// aiエージェントを叩いてテキストを取得
async function getAiResponse(message) {
  try {
    console.log({
      "user_message": message,
      "room_id": docRefId,
    });
    const response = await fetch("/chat/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "user_message": message,
        "room_id": docRefId,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('Success: chat');
  } catch (error) {
    console.error('Error:', error);
    // エラーハンドリング (UIにエラーメッセージを表示するなど)
    throw error; //エラーを呼び出し元に再度投げる。
  }
}

// メッセージを生成してぶちこむ
export function addMessageToChat(message, sender, id) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
  messageElement.id = id;
  messageElement.textContent = message;
  messageBox.appendChild(messageElement);
  messageBox.scrollTop = messageBox.scrollHeight;
}