// APIのエンドポイント (仮のURL)
const apiUrl = "/process-image";

const projectId = 'artisanallyproject';
const databaseId = '(default)';
const collectionName = 'rooms';

// 画像がアップロードされた時の処理
async function handleImageUpload(file) {
  showLoadingScreen();
  try {
    const jsonData = await getJsonData(file);
    const docId = sendImageToApi(jsonData);
    const firestoreDoc = await getFirestoreDoc(docId);
    displayImageData(firestoreDoc);
    showResultScreen();
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
  console.log(jsonData.image.substr(0, 30) + "......");
  console.log(jsonData.image_type);
  return "j1xs99a2ftshojouuuya";
}

function getRepColors(rep_colors) {
  const rgbValues = [];
  for (const key in rep_colors.mapValue.fields) {
    if (rep_colors.mapValue.fields.hasOwnProperty(key)) {
      const field = rep_colors.mapValue.fields[key];
      if (field.arrayValue && field.arrayValue.values && Array.isArray(field.arrayValue.values)) {
        const values = field.arrayValue.values;
        const rgb = values.map(value => {
          if (value.hasOwnProperty("integerValue")){
            return parseInt(value.integerValue, 10);
          }
          return null;
        });
        const hexCode = `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;
        rgbValues.push(hexCode);
      }
    }
  }
  return rgbValues;
}

// firestoreのデータを取得
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

// 各種情報を配置
function displayImageData(firestoreDoc) {
  console.log(firestoreDoc);

  const bucketName = firestoreDoc.fields.bucket_name.stringValue;
  const storageBaseURL = `https://storage.googleapis.com/${bucketName}/images/`

  // アップロードされた画像を表示
  const originalImageName = firestoreDoc.fields.original_image_name.stringValue;
  const originalImageUrl = storageBaseURL + originalImageName;
  const img = document.createElement('img');
  img.src = originalImageUrl;
  img.style.maxWidth = '100%';
  img.style.maxHeight = '100%';
  loadedImageDiv.innerHTML = '';
  loadedImageDiv.appendChild(img);

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

  // タブ2を設定 ヒストグラム
  const histogramImageName = firestoreDoc.fields.histogram_image_name.stringValue;
  const histogramImageUrl = storageBaseURL + histogramImageName;
  const  histogramDescriptionText = firestoreDoc.fields.histogram_explanation.stringValue;
  histogramDiv.innerHTML = `<img src="${histogramImageUrl}" alt="Histogram" style="width: 100%;">`;
  histogramDescription.textContent = histogramDescriptionText;

  // タブ3を設定 ヒートマップ
  const heatmapImageName = firestoreDoc.fields.heatmap_image_name.stringValue;
  const heatmapImageUrl = storageBaseURL + heatmapImageName;
  const heatmapDescriptionText  = firestoreDoc.fields.heatmap_explanation.stringValue;
  toggleSwitch1.checked = true;
  heatmapDiv.innerHTML = `<img src="${heatmapImageUrl}" alt="Heatmap" style="width: 100%;">`;
  heatmapDescription.textContent = heatmapDescriptionText;

  // タブ4を設定 バックグランドリムーバル
  const backgroundRemovalImageName = firestoreDoc.fields.back_removed_image_name.stringValue;
  const backgroundRemovalImageUrl = storageBaseURL + backgroundRemovalImageName;
  toggleSwitch2.checked = true;
  backgroundRemovalDiv.innerHTML = `<img src="${backgroundRemovalImageUrl}" alt="Heatmap" style="width: 100%;">`;


  // タブの初期表示
  showTab('tabpage1');
}
