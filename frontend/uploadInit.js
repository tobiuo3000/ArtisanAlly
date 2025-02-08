const uploadTile = document.getElementById('uploadTile');

let originalImageUrl = null; // 画像アップロード後に元の画像のURLを保持するための変数

// 画像をアップロードタイルにドラッグ中の動作
uploadTile.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = '#e0e0e0';
});

// ドラッグが離れた時の動作
uploadTile.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = '';
});

// 画像がドロップされた時の動作
uploadTile.addEventListener('drop', (e) => {
  e.preventDefault(); // デフォルトの動作を防ぐ
  uploadTile.style.backgroundColor = '';
  const file = e.dataTransfer.files[0]; // ドロップされた１枚目のファイルを取得
  if (file && file.type.startsWith('image/')) { // 画像なら関数を呼び出し、そうでなければアラートを出す
    handleImageUpload(file);
  } else {
    alert('画像ファイルをドロップしてください。');
  }
});


// APIのエンドポイント (仮のURL)
const apiUrl = "/process-image";

const projectId = 'artisanallyproject';
const databaseId = '(default)';
const collectionName = 'rooms';

// 画像がアップロードされた時の処理
async function handleImageUpload(file) {
  showLoadingScreen(); // ローディング画面を表示
  try {
    const jsonData = await getJsonData(file); // 画像データをJSON形式に変換
    const docId = sendImageToApi(jsonData); // JSONデータをAPIに送信
    const firestoreDoc = await getFirestoreDoc(docId); // Firestoreから解析結果を取得
    displayImageData(firestoreDoc); // 取得したデータを画面に表示
    showResultScreen(); // 結果画面に切り替える
  } catch (error) { // 途中でエラーが発生した場合
    console.error("Error processing image:", error); // エラーをログに記録
    alert("Error: " + error.message); // 警告ダイアログを表示
    showUploadScreen(); // アップロード画面に戻す
  }
}

// JSONデータをBase64に整形する
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

// Firestoreのデータから代表色（rep_colors）を抽出し、Hexコードのリストとして返す関数
function getRepColors(rep_colors) {
  const rgbValues = []; // 最終的に代表色のHexコードを格納する配列
  for (const key in rep_colors.mapValue.fields) { // mapValue.fields に含まれるすべての color1, color2, ... などの代表色をループ処理。
    if (rep_colors.mapValue.fields.hasOwnProperty(key)) { //keyの値を取得し、データが配列形式かどうかを確認
      const field = rep_colors.mapValue.fields[key];
      if (field.arrayValue && field.arrayValue.values && Array.isArray(field.arrayValue.values)) {
        const values = field.arrayValue.values; // values.mapを使い、Firestore形式(intergeValue)から数値（整数）として取得する。RGB値は[255,0,0]のような配列で格納
        const rgb = values.map(value => {
          if (value.hasOwnProperty("integerValue")){
            return parseInt(value.integerValue, 10);
          }
          return null;
        });
        const hexCode = `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`; // RGB値をHexコード(16新数)に変換し、#FF00FFのような形にする
        rgbValues.push(hexCode); // 変換したHexコードをリストに追加
      }
    }
  }
  return rgbValues; // 最終的にHexコードを返す
}

// firestoreにアクセスし、指定したdocIdのデータを取得
async function getFirestoreDoc(docId) {
  const baseURL = "https://firestore.googleapis.com/v1/projects/"
  const databaseURL = baseURL + `${projectId}/databases/${databaseId}`
  let documentUrl = databaseURL + `/documents/${collectionName}/${docId}`;
  return await fetch(documentUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching document:', error);
    });
}

// Firestoreから取得した各種情報を配置していく関数
function displayImageData(firestoreDoc) {
  console.log(firestoreDoc);

  const bucketName = firestoreDoc.fields.bucket_name.stringValue;
  const storageBaseURL = `https://storage.googleapis.com/${bucketName}/images/`

  // タブ1を設定 カラー
  const rep_colors = getRepColors(firestoreDoc.fields.rep_colors);
  for (const color in rep_colors) {
    // 丸い背景色のみの小さな要素を複数配置する
    const dropTile = document.createElement('div');
    dropTile.id = color;
    dropTile.className = 'drop-tile';
    // 背景色にcolorを追加
    dropTile.style.backgroundColor = rep_colors[color];
    repColors.appendChild(dropTile);
  }

  // アップロードされた画像を表示
  const originalImageName = firestoreDoc.fields.original_image_name.stringValue;
  originalImageUrl = storageBaseURL + originalImageName;
  const img = document.createElement('img');
  img.src = originalImageUrl;
  img.id = "originalImage";
  img.style.maxWidth = '100%';
  img.style.maxHeight = '100%';
  loadedImageDiv.style.backgroundColor = rep_colors[0];
  loadedImageDiv.innerHTML = '';
  loadedImageDiv.appendChild(img);

  // タブ2を設定 ヒストグラム
  const histogramImageName = firestoreDoc.fields.histogram_image_name.stringValue;
  const histogramImageUrl = storageBaseURL + histogramImageName;
  const  histogramDescriptionText = firestoreDoc.fields.histogram_explanation.stringValue;
  histogramDiv.innerHTML = `<img src="${histogramImageUrl}" alt="Histogram">`;
  histogramDescription.textContent = histogramDescriptionText;

  // タブ3を設定 ヒートマップ
  const heatmapImageName = firestoreDoc.fields.heatmap_image_name.stringValue;
  const heatmapImageUrl = storageBaseURL + heatmapImageName;
  const heatmapDescriptionText  = firestoreDoc.fields.heatmap_explanation.stringValue;
  toggleSwitch1.checked = false;
  heatmapDiv.innerHTML = `<img src="${heatmapImageUrl}" alt="Heatmap" id="heatmapImage">`;
  heatmapDescription.textContent = heatmapDescriptionText;

  // タブ4を設定 バックグランドリムーバル
  const backgroundRemovalImageName = firestoreDoc.fields.back_removed_image_name.stringValue;
  const backgroundRemovalImageUrl = storageBaseURL + backgroundRemovalImageName;
  toggleSwitch2.checked = false;
  backgroundRemovalDiv.innerHTML = `<img src="${backgroundRemovalImageUrl}" alt="Heatmap" id="backgroundRemovalImage">`;

  // AIチャットの講評をチャット欄の一番最初に乗っける
  const aiChatText = firestoreDoc.fields.main_explanation.stringValue;
  addMessageToChat(aiChatText, 'ai')


  // タブの初期表示
  showTab('tabpage1');
}
