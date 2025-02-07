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
  const tarTab = document.querySelector(`#tabcontrol a[href="#${tabId}"]`);
  tarTab.classList.add('active');
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
  heatmapDiv.style.display = toggleSwitch1.checked ? 'block' : 'none';
});


// 右 タブ4 バックグラウンドリムーバル トグルボタン処理
toggleSwitch2.addEventListener('change', () => {
  backgroundRemovalDiv.style.display = toggleSwitch2.checked ? 'block' : 'none';
});