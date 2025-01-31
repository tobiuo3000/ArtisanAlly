document.addEventListener("DOMContentLoaded", () => { // HTMLが読み込まれたら処理を開始
    const uploadTile = document.getElementById("uploadTile");
    const dndText = document.getElementById("dndText");

    // 特定の画像フォーマットを定義
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

    // ドラッグオーバー時の処理
    uploadTile.addEventListener("dragover", function(event){
        event.preventDefault(); // ブラウザの機能で勝手に動くのを防ぐ的な
        uploadTile.classList.add("dragging"); // 背景色変更
    });

    // ドラッグリーブ（領域外に出た時）の処理
    uploadTile.addEventListener("dragleave", () => {
        uploadTile.classList.remove("dragging"); // 背景色戻す
    });

    // ドロップ時の処理
    uploadTile.addEventListener("drop", (event) => {
        event.preventDefault();
        uploadTile.classList.remove("dragging");
        
        const files = event.dataTransfer.files; // files定数にリスト形式の配列を入れる
        if (files.length > 0) { // files定数にファイルが１個でもあるなら実行する
            const file = files[0];
            if (allowedTypes.includes(file.type)) { // 定義した特定の画像ファイルなら実行
                const reader = new FileReader();
                reader.onload = () => { // ファイルが読み込まれたら実行される
                    // 読み込んだファイルをサーバーに送る（TODO）
                    const  segmentedImage = getSegmentationImage(reader.result); // 下に定義する
                    displayImage(segmentedImage);
                };

                reader.readAsDataURL(file);
            } else {
                alert("画像ファイルをドロップしてください。");
            }
        }
    });

    // 画像を表示する関数
    function displayImage(imageSrc) {
        dndText.innerHTML = `<img src="${imageSrc}" alt="プレビュー" id="previewImage">`; // innnerHTMLに代入することで画像に置き換え
    }

    const trash = document.getElementById("trash");
    // 画像を削除する関数
    trash.addEventListener("mouseup", () => {
        dndText.innerHTML = "<img src=\"./images/upload_hoso.png\" alt=\"upload\" id=\"uploadImg\">D & D";
    })

});
