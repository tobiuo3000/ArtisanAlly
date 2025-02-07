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


// タブ切り替えの関数
function showTab(tabId) {
  const tabContents = document.querySelectorAll('.descriptionItem');
  tabContents.forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';

  // アクティブなタブのスタイル変更
  const tabLinks = document.querySelectorAll('#tabcontrol a');
  tabLinks.forEach(link => link.classList.remove('active'));
  tabLinks.forEach(link => {
    link.firstElementChild.classList.remove('noneTransparent');
  });
  const tarTab = document.querySelector(`#tabcontrol a[href="#${tabId}"]`);
  tarTab.classList.add('active');
  tarTab.firstElementChild.classList.add('noneTransparent');
  tabbodyDiv.style.backgroundColor = window.getComputedStyle(tarTab).getPropertyValue("background-color");
}


// タブのクリック時処理
document.querySelectorAll('#tabcontrol a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabId = link.getAttribute('href').substring(1);
    showTab(tabId);
  });
});


// 右 タブ3 ヒートマップ トグルボタン処理
toggleSwitch1.addEventListener('change', () => {
  if (toggleSwitch2.checked) {
    toggleSwitch2.checked = false;
  }
  if (toggleSwitch1.checked) {
    const heatmapImage = document.getElementById('heatmapImage');
    const imageUrl = heatmapImage.src;
    const leftPanelImageElem = document.getElementById('originalImage');
    leftPanelImageElem.src = imageUrl;
  } else {
    const leftPanelImageElem = document.getElementById('originalImage');
    leftPanelImageElem.src = originalImageUrl;
  }
});


// 右 タブ4 バックグラウンドリムーバル トグルボタン処理
toggleSwitch2.addEventListener('change', () => {
  if (toggleSwitch1.checked) {
    toggleSwitch1.checked = false;
  }
  if (toggleSwitch2.checked) {
    const backgroundRemovalImage = document.getElementById('backgroundRemovalImage');
    const imageUrl = backgroundRemovalImage.src;
    const leftPanelImageElem = document.getElementById('originalImage');
    leftPanelImageElem.src = imageUrl;
  } else {
    const leftPanelImageElem = document.getElementById('originalImage');
    leftPanelImageElem.src = originalImageUrl;
  }
});