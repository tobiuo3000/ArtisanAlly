const uploadScreen = document.getElementById('uploadScreen');
const loadingScreen = document.getElementById('loadingScreen');
const resultScreen = document.getElementById('resultScreen');
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

const tabbodyDiv = document.getElementById('tabbody');

uploadTile.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = '#e0e0e0'; // ドラッグオーバー時のスタイル
});
uploadTile.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = ''; // ドラッグリーブ時のスタイル
});
uploadTile.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadTile.style.backgroundColor = ''; // ドロップ時のスタイル
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageUpload(file);
  } else {
    alert('画像ファイルをドロップしてください。');
  }
});

// input type="file" の要素も同様にイベントをリッスンする（もしあれば）
//  <input type="file" id="fileInput" style="display: none;"> のような要素がある場合
const fileInput = document.getElementById('fileInput'); // もし存在する場合
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      alert('画像ファイルを選択してください。');
    }
  });
  // uploadTileをクリックしたときに、fileInputのクリックイベントを発火させる（もしあれば）
  uploadTile.addEventListener('click', () => {
    fileInput.click();
  });
}

// タブ切り替えの関数
function showTab(tabId) {
  const tabContents = document.querySelectorAll('.descriptionItem');
  tabContents.forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';

  // アクティブなタブのスタイル変更
  const tabLinks = document.querySelectorAll('#tabcontrol a');
  tabLinks.forEach(link => link.classList.remove('active'));
  const tarTab = document.querySelector(`#tabcontrol a[href="#${tabId}"]`);
  tarTab.classList.add('active');
  tabbodyDiv.style.backgroundColor = window.getComputedStyle(tarTab).getPropertyValue("background-color");
}

// タブのクリックイベントリスナー
document.querySelectorAll('#tabcontrol a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabId = link.getAttribute('href').substring(1); // '#' を取り除く
    showTab(tabId);
  });
});

toggleSwitch1.addEventListener('change', () => {
  heatmapDiv.style.display = toggleSwitch1.checked ? 'block' : 'none';
});
toggleSwitch2.addEventListener('change', () => {
  backgroundRemovalDiv.style.display = toggleSwitch2.checked ? 'block' : 'none';
});

// 画面表示制御
function showLoadingScreen() {
  uploadScreen.classList.add('hidden');
  loadingScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden'); // resultScreenを非表示にする
}

function showResultScreen() {
  uploadScreen.classList.add('hidden');
  loadingScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
}
function showUploadScreen() {
  uploadScreen.classList.remove('hidden');
  loadingScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
}

// 初期表示
showUploadScreen();