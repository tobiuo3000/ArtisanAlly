document.addEventListener("DOMContentLoaded", () => { // HTMLが読み込まれたら処理を開始
    const uploadTile = document.getElementById("uploadTile");
    const dndText = document.getElementById("dndText");

    // 特定の画像フォーマットを定義
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

    // ドラッグオーバー時の処理
    uploadTile.addEventListener("dragover", function(event){
        event.preventDefault(); // ブラウザの機能で勝手に動くのを防ぐ的な機能
        uploadTile.classList.add("dragging"); // 背景色変更のクラスを追加
    });

    // ドラッグリーブ（領域外に出た時）の処理
    uploadTile.addEventListener("dragleave", () => {
        uploadTile.classList.remove("dragging"); // 背景色を元に戻す
    });

    // ドロップ時の処理
    uploadTile.addEventListener("drop", (event) => {
        event.preventDefault();
        uploadTile.classList.remove("dragging");
        
        const files = event.dataTransfer.files; // files定数にリスト形式の配列を入れる
        if (files.length > 0) { // files定数にファイルが１個でもあるなら実行する
            const file = files[0]; // 最初のファイルのみ処理
            if (allowedTypes.includes(file.type)) { // 事前に定義した、特定の画像ファイルなら実行
                const reader = new FileReader();
                reader.onload = () => { // ファイルが読み込まれたら実行される
                    const ImageSrc = reader.result;
                    displayImage(ImageSrc);
                    const resultList = ImageSrc.split(",");
                    const base64data = resultList[resultList.length - 1];
                    const jsonData = {
                        image: base64data, // BASE64でエンコード画像データを格納
                        image_type: file.type.split("/")[1] // 拡張子の名前を格納
                    }
                    getSegmentationImage(jsonData); // 下に定義する
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
        // スタイルを適用して枠内に収める
        const previewImage = document.getElementById("previewImage");    
        previewImage.style.maxWidth = "100%"; // 横幅を超えない
        previewImage.style.maxHeight = "100%"; // 高さを超えない
        previewImage.style.objectFit = "contain"; // アスペクト比を維持しつつフィット

        previewImage.dataset.scale = "1"; // 初期スケールを1に設定
    }

    const expand = document.getElementById("expand");
    const shrink = document.getElementById("shrink");
    const trash = document.getElementById("trash");

    // 画像を拡大する関数
    expand.addEventListener("mouseup", () => {
        const previewImage = document.getElementById("previewImage");
        if (previewImage) {
            let scale = parseFloat(previewImage.dataset.scale);
            scale = Math.min(scale + 0.1, 2); // 最大2倍まで拡大
            previewImage.style.transform = `scale(${scale})`;
            previewImage.dataset.scale = scale.toString();
        }
    });

    // 画像を縮小する関数
    shrink.addEventListener("mouseup", () => {
        const previewImage = document.getElementById("previewImage");
        if (previewImage) {
            let scale = parseFloat(previewImage.dataset.scale);
            scale = Math.max(scale - 0.1, 0.5); // 最小0.5倍まで縮小
            previewImage.style.transform = `scale(${scale})`;
            previewImage.dataset.scale = scale.toString();
        }
    });

    // 画像を削除する関数
    trash.addEventListener("mouseup", () => {
        dndText.innerHTML = `
            <img src="./images/upload_hoso.png" alt="upload" id="uploadImg">
            D & D
        `;
    });



    // サーバーへJSONを送信する関数
    function getSegmentationImage(jsonData) {
        fetch("https://chat-471591578999.asia-northeast1.run.app/image/", {
            method: "POST", // POSTメソッドでサーバーにデータを送信
            headers: {
                "Content-Type": "application/json" // ここで送信するデータがJSON形式であることを明示
            },
            body: JSON.stringify(jsonData) // JSONを文字列に変換して送信する機能
        })
        .then(response => response.json()) // サーバーからのレスポンスをJSONとして解析
        .then(data => {
            console.log("サーバーからのレスポンス:", data);
        })
        .catch(error => {
            console.error("エラーが発生しました:", error);
        });
    }

});
