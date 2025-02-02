// 基準値
const baseWidth = 1920;
const baseHeight = 1080;

// 一括計算を適用する関数
function applyDynamicStyles() {
    // 動的スタイルを適用する要素を取得
    const elements = document.querySelectorAll(
        '.title, .other-icons, .top-content,  .edit-icons, .drug-and-drop, .create-button, .pannels .bottom-pannel, AI-chat, bubble_icon, .AI chat'
    );

    elements.forEach((element) => {
        // 各要素のカスタムプロパティ（CSS変数）を取得
        const styles = getComputedStyle(element);
        const topValue = parseFloat(styles.getPropertyValue('--top')) || 0;
        const leftValue = parseFloat(styles.getPropertyValue('--left')) || 0;
        const widthValue = parseFloat(styles.getPropertyValue('--width')) || 0;
        const heightValue = parseFloat(styles.getPropertyValue('--height')) || 0;

        // 高さなどの値が正しく設定るかどうかのデバッグ用コード
        console.log(`Element: ${element.className}, Top: ${topValue}, Left: ${leftValue}, Width: ${widthValue}, Height: ${heightValue}`);

        // インラインスタイルに計算結果を適用
        element.style.top = `${(topValue / baseHeight) * 100}%`;
        element.style.left = `${(leftValue / baseWidth) * 100}%`;
        element.style.width = `${(widthValue / baseWidth) * 100}%`;
        element.style.height = `${(heightValue / baseHeight) * 100}%`;
    });
}

// ページ読み込み後に一括適用
document.addEventListener('DOMContentLoaded', applyDynamicStyles);

// 必要に応じてリサイズ時も再計算
window.addEventListener('resize', applyDynamicStyles);
