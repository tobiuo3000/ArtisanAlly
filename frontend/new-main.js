document.addEventListener("DOMContentLoaded", () => {
    const uploadScreen = document.getElementById("uploadScreen");
    const loadingScreen = document.getElementById("loadingScreen");
    const resultScreen = document.getElementById("resultScreen");
    const uploadTile = document.getElementById("uploadTile");
    const previewImage = document.getElementById("previewImage");

    // 画像のドラッグ＆ドロップ処理
    uploadTile.addEventListener("drop", (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
                previewImage.src = reader.result;
                switchToLoadingScreen();
            };
            reader.readAsDataURL(file);
        }
    });

    // 画面切り替え関数
    function switchToLoadingScreen() {
        uploadScreen.classList.add("hidden");
        loadingScreen.classList.remove("hidden");

        setTimeout(() => { // ローディング完了後に結果画面へ
            loadingScreen.classList.add("hidden");
            resultScreen.classList.remove("hidden");
        }, 2000); // 2秒後に切り替え
    }

});
