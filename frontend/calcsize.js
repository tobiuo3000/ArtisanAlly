// 基準値
const baseWidth = 1920;
const baseHeight = 1080;

// 一括計算を適用する関数
function applyDynamicStyles() {
    // 動的スタイルを適用する要素を取得
    const elements = document.querySelectorAll(
        '.title'
    );

    elements.forEach((element) => {
        // 各要素のカスタムプロパティ（CSS変数）を取得
        const styles = getComputedStyle(element);
        const topValue = parseFloat(styles.getPropertyValue('--top')) || 0;
        const leftValue = parseFloat(styles.getPropertyValue('--left')) || 0;

        // インラインスタイルに計算結果を適用
        element.style.top = `${(topValue / baseWidth) * 100}%`;
        element.style.left = `${(leftValue / baseHeight) * 100}%`;
    });
}

// ページ読み込み後に一括適用
document.addEventListener('DOMContentLoaded', applyDynamicStyles);

// 必要に応じてリサイズ時も再計算
window.addEventListener('resize', applyDynamicStyles);
