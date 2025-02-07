const uploadScreen = document.getElementById('uploadScreen');
const loadingScreen = document.getElementById('loadingScreen');
const resultScreen = document.getElementById('resultScreen');

function showLoadingScreen() {
  uploadScreen.classList.add('hidden');
  loadingScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
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

showLoadingScreen();
document.addEventListener("DOMContentLoaded", () => {
    showLoadingScreen();
  });
