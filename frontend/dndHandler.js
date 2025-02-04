document.addEventListener("DOMContentLoaded", () => { // HTMLが読み込まれたら処理を開始
    const uploadTile = document.getElementById("uploadTile");
    const dndText = document.getElementById("dndText");
    const messageBox = document.getElementById("messageBox"); 
    const inputMsg = document.getElementById("inputMsg"); 
    const sendBtn = document.getElementById("sendBtn"); 

    const createBtn = document.getElementById("createBtn"); // createBtnを追加
    const leftPanel = document.getElementById("leftPanel"); // leftPanelを追加

    let isDragging = false;
    let startX, startY;

    // 初期状態でCREATEボタンを無効化（読み込まれた際に有効化する）
    createBtn.disabled = true;

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
                    getSegmentationImage(jsonData); // サーバーへデータ送信
                };

                reader.readAsDataURL(file);
            } else {
                alert("画像ファイルをドロップしてください。");
            }
        }
    });

    // 画像を表示する関数
    function displayImage(imageSrc) {
     // 以前の画像があれば削除
     const existingImage = document.getElementById("previewImage");
     if (existingImage) {
         existingImage.remove();
     }
        // 新しい画像要素を作成
        const previewImage = document.createElement("img");
        previewImage.src = imageSrc;
        previewImage.alt = "プレビュー";
        previewImage.id = "previewImage";

        previewImage.style.maxWidth = "100%"; // 横幅を超えない
        previewImage.style.maxHeight = "100%"; // 高さを超えない
        previewImage.style.objectFit = "contain"; // アスペクト比を維持しつつフィット
        previewImage.style.position = "absolute";  
        previewImage.style.left = "50%";
        previewImage.style.top = "50%";
        previewImage.style.transform = "translate(-50%, -50%)"; // 画像の中央揃え
        previewImage.style.transformOrigin = "center"; 
        previewImage.dataset.scale = "1"; // 初期スケールを1に設定

        // 画像の基準を #leftPanel にする
        leftPanel.style.position = "relative";
        leftPanel.appendChild(previewImage);
    
        enableCreateButton(); // ボタンの有効化

    }

    // 画像が読み込まれたらボタンを有効化
    function enableCreateButton() {
        createBtn.disabled = false;
    }

    // CREATEボタンのクリック時の処理（画像があるときのみ）
    createBtn.addEventListener("click", () => {
        if (!document.getElementById("previewImage")) return;
        createBtn.style.display = "none";
    });

    // 右クリックメニューを無効化（誤動作を防ぐため）
    leftPanel.addEventListener("contextmenu", (event) => event.preventDefault()); 

    // 画像のドラッグ移動処理（マウスダウン時）
    leftPanel.addEventListener("mousedown", (event) => {
        if (event.button === 2) { // 右クリック時のみ実行
            event.preventDefault(); // ブラウザのデフォルト動作を防ぐ（右クリックメニューを開かせない）
            isDragging = true;
    
            const previewImage = document.getElementById("previewImage");
            if (!previewImage) return; // 画像がない場合は何もしない

            // 画像と leftPanel の座標情報を取得
            const imageRect = previewImage.getBoundingClientRect(); // 画像の現在の位置
            const panelRect = leftPanel.getBoundingClientRect(); // 左パネルの現在の位置

            // **デバッグ用ログ**
            console.log("mousedown - マウスクリック座標:", event.clientX, event.clientY);
            console.log("mousedown - 画像の位置:", imageRect.left, imageRect.top);
            console.log("mousedown - 左パネルの位置:", panelRect.left, panelRect.top);

            // マウスの位置を基準に、画像の移動開始時のオフセットを計算
            startX = event.clientX - imageRect.left; // 画像の左端からマウスまでの距離
            startY = event.clientY - imageRect.top; // 画像の上端からマウスまでの距離
        }
    });

    // マウスを動かしたときの処理（画像を移動）
    leftPanel.addEventListener("mousemove", (event) => {
        if (isDragging) { // 右クリックでドラッグ中の場合のみ実行
            const previewImage = document.getElementById("previewImage");
            if (!previewImage) return; // 画像がない場合は何もしない

            const panelRect = leftPanel.getBoundingClientRect(); // 左パネルの現在の位置
 
            // 画像の幅と高さを取得（拡大縮小を考慮）
            let imgWidth = previewImage.offsetWidth;
            let imgHeight = previewImage.offsetHeight;
            
            // 現在のマウス位置を取得し、ドラッグ開始時のオフセットを適用
            let newX = Math.max(0, Math.min(panelRect.width - previewImage.clientWidth, event.clientX - panelRect.left - startX));
            let newY = Math.max(0, Math.min(panelRect.height - previewImage.clientHeight, event.clientY - panelRect.top - startY));
    
            // 左パネル内に画像を制限（はみ出さないようにする）
            newX = Math.max(0, Math.min(panelRect.width - imgWidth, newX));
            newY = Math.max(0, Math.min(panelRect.height - imgHeight, newY));
            
            // 画像の位置を更新（CSS の left/top を変更）
            previewImage.style.left = `${newX}px`;
            previewImage.style.top = `${newY}px`;
        }
    });

    // マウスを離したとき（ドラッグ終了処理）
    document.addEventListener("mouseup", () => isDragging = false); // ドラッグフラグを無効化
    // マウスが `leftPanel` の外に出たとき（ドラッグ解除）
    leftPanel.addEventListener("mouseleave", () => isDragging = false); // ドラッグフラグを無効化


/*
    右下のアイコンに関する部分（左右反転・拡大・縮小・削除・）

*/

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

    // 画像の削除機能
    trash.addEventListener("mouseup", () => {
        dndText.innerHTML = `<img src="./images/upload_hoso.png" alt="upload" id="uploadImg"> D & D`;
        createBtn.style.display = "block"; // 削除後、ボタンを再表示
        createBtn.disabled = true; // ボタンを無効化
    });

    // 送信ボタンを押したときの処理
    sendBtn.addEventListener("click", () => {
        const userMessage = inputMsg.value.trim();
        if (userMessage.length > 0) {
            addMessage(userMessage, "messageElemUs");
            inputMsg.value = ""; // 入力欄をクリア
        }
    });

    // メッセージを追加、表示する処理
    function addMessage(text, className) {
        const messageElem = document.createElement("div");
        messageElem.classList.add(className);
        if (className === "messageElemUs") {
            messageElem.textContent = text;  // ユーザー入力は textContent で XSS 防止
        } else {
            messageElem.innerHTML = `<pre>${text}</pre>`;  // AI レスポンスは改行保持
        }
        messageBox.appendChild(messageElem);
        messageBox.scrollTop = messageBox.scrollHeight; // 最新メッセージへスクロール
    }


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
            addMessage(JSON.stringify(data), "messageElemAi");
        })
        .catch(error => {
            console.error("エラーが発生しました:", error);
            addMessage("エラーが発生しました", "messageElemAi");
        });
    }

});



// `mouseup` を `document` に適用して、確実にドラッグを解除
document.addEventListener("mouseup", () => isDragging = false);
document.addEventListener("mouseleave", () => isDragging = false);
