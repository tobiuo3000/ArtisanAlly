import { showLoadingScreen, showResultScreen, showUploadScreen } from "./main.js";
import { addMessageToChat } from "./aiChat.js";
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

// APIのエンドポイント (仮のURL)
const apiUrl = "/process-image";

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
let unsubscribe = null;

let originalImageUrl = null;

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
    const docId = sendImageToApi(jsonData);
    const firestoreDoc = await getFirestoreDoc(docId);
    displayImageData(firestoreDoc);
    showResultScreen();
    setupRealtimeListener(docId);
  } catch (error) {
    console.error("Error processing image:", error);
    alert("Error: " + error.message);
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
function sendImageToApi(jsonData) {
  // ダミーデータを戻す
  console.log(apiUrl);
  console.log(jsonData.image.substr(0, 30) + "......");
  console.log(jsonData.image_type);
  return "j1xs99a2ftshojouuuya";
}

function getRepColors(rep_colors) {
  const result = [];
  for (const [key, value] of Object.entries(rep_colors)) {
    result.push({ id: key, values: value });
  }
  result.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  return result;
}

// firestoreのデータを取得
async function getFirestoreDoc(docId) {
  try {
    const docSnapshot = await db.collection(collectionName).doc(docId).get();
    if (!docSnapshot.exists) {
      throw new Error("Firestore document not found.");
    }
    return docSnapshot.data();
  } catch (error) {
    throw new Error(`Failed to fetch Firestore data: ${error.message}`);
  }
}

// Firestoreのリアルタイムリスナーを設定
function setupRealtimeListener(docId) {
  // 以前のリスナーがあれば解除
  if (unsubscribe) {
    unsubscribe();
  }
  unsubscribe = db.collection(collectionName).doc(docId)
    .onSnapshot((docSnapshot) => {
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        displayImageData(data); // データを表示 (リアルタイム更新)
        // 何かしらの関数を実行 (例: データ変更時の通知)
        onDataChanged(data);
      } else {
        console.log("Document does not exist (anymore).");
      }
    }, (error) => {
      console.error("Error in realtime listener:", error);
    });
}


// 各種情報を配置
function displayImageData(firestoreDoc) {
  console.log(firestoreDoc);

  const bucketName = firestoreDoc.bucket_name;
  const storageBaseURL = `https://storage.googleapis.com/${bucketName}/images/`

  // タブ1を設定 カラー
  if ("rep_colors" in firestoreDoc) {
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
  }

  // アップロードされた画像を表示
  if ("original_image_name" in firestoreDoc) {
    const originalImageName = firestoreDoc.original_image_name;
    originalImageUrl = storageBaseURL + originalImageName;
    const img = document.createElement('img');
    img.src = originalImageUrl;
    img.id = "originalImage";
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    loadedImageDiv.style.backgroundColor = rep_colors[0];
    loadedImageDiv.innerHTML = '';
    loadedImageDiv.appendChild(img);
  }

  // タブ2を設定 ヒストグラム
  if ("histogram_image_name" in firestoreDoc && "histogram_explanation" in firestoreDoc) {
    const histogramImageName = firestoreDoc.histogram_image_name;
    const histogramImageUrl = storageBaseURL + histogramImageName;
    const  histogramDescriptionText = firestoreDoc.histogram_explanation;
    histogramDiv.innerHTML = `<img src="${histogramImageUrl}" alt="Histogram">`;
    histogramDescription.textContent = histogramDescriptionText;
  }

  // タブ3を設定 ヒートマップ
  if ("heatmap_image_name" in firestoreDoc && "heatmap_explanation" in firestoreDoc) {
    const heatmapImageName = firestoreDoc.heatmap_image_name;
    const heatmapImageUrl = storageBaseURL + heatmapImageName;
    const heatmapDescriptionText  = firestoreDoc.heatmap_explanation;
    toggleSwitch1.checked = false;
    heatmapDiv.innerHTML = `<img src="${heatmapImageUrl}" alt="Heatmap" id="heatmapImage">`;
    heatmapDescription.textContent = heatmapDescriptionText;
  }

  // タブ4を設定 バックグランドリムーバル
  if ("back_removed_image_name" in firestoreDoc) {
    const backgroundRemovalImageName = firestoreDoc.back_removed_image_name;
    const backgroundRemovalImageUrl = storageBaseURL + backgroundRemovalImageName;
    toggleSwitch2.checked = false;
    backgroundRemovalDiv.innerHTML = `<img src="${backgroundRemovalImageUrl}" alt="Heatmap" id="backgroundRemovalImage">`;

  }
  // AIチャットの講評をチャット欄の一番最初に乗っける
  if ("main_explanation" in firestoreDoc) {
    const aiChatText = firestoreDoc.main_explanation;
    addMessageToChat(aiChatText, 'ai')
  }
  // タブの初期表示
  showTab('tabpage1');
}

// データ変更確認
function onDataChanged(data) {
  console.log("Data changed:", data);
}