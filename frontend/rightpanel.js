document.addEventListener("DOMContentLoaded", function () {
    // ---------------------------
    // ▼A：対象要素を取得
    // ---------------------------
    const tabs = document.getElementById("tabcontrol").getElementsByTagName("a");
    const pages = document.getElementById("tabbody").getElementsByTagName("div");

    // ---------------------------
    // ▼B：タブの切り替え処理
    // ---------------------------
    function changeTab(event) {
        event.preventDefault(); // ▼B-4. ページ遷移を防ぐ

        // ▼B-1. href属性値から対象のid名を取得
        const targetId = this.getAttribute("href").substring(1);

        // ▼B-2. 指定のタブページだけを表示する
        Array.from(pages).forEach(page => {
            page.style.display = page.id === targetId ? "block" : "none";
        });

        // ▼B-3. クリックされたタブを前面に表示
        Array.from(tabs).forEach(tab => {
            tab.style.zIndex = "0";
        });
        this.style.zIndex = "10";
    }

    // ---------------------------
    // ▼C：すべてのタブにクリックイベントを設定
    // ---------------------------
    Array.from(tabs).forEach(tab => {
        tab.addEventListener("click", changeTab);
    });

    // ---------------------------
    // ▼D：最初のタブを選択状態にする
    // ---------------------------
    if (tabs.length > 0) {
        tabs[0].click();
    }
});