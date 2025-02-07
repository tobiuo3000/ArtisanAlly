// 画面表示制御
const uploadScreen = document.getElementById('uploadScreen');
const loadingScreen = document.getElementById('loadingScreen');
const resultScreen = document.getElementById('resultScreen');

// 初期画面を表示する
function showLoadingScreen() {
  uploadScreen.classList.add('hidden');
  loadingScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
}
// ロード画面を表示する
function showResultScreen() {
  uploadScreen.classList.add('hidden');
  loadingScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
}
// 結果画面を表示する
function showUploadScreen() {
  uploadScreen.classList.remove('hidden');
  loadingScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
}
// 初期状態は「初期画面」なので、下記を実行
showUploadScreen();