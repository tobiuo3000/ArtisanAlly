import os
import base64
import uuid
from datetime import datetime
from flask import Flask, request, redirect, url_for, jsonify
from google.cloud import storage
from google.cloud import firestore

app = Flask(__name__)

BUCKET_NAME = "my-flask-chat-bucket" 

db = firestore.Client()

def upload_image_to_cloud_storage(base64_image: str) -> str:
    """
    base64形式の画像データをCloud Storageにアップロードし、
    公開アクセス可能なURLを返すサンプル関数
    """
    # 例: "data:image/png;base64,..." のようなデータURL形式の場合は頭を切り取る
    if "," in base64_image:
        base64_image = base64_image.split(",")[1]
    
    image_data = base64.b64decode(base64_image)
    
    filename = f"{uuid.uuid4()}.png"  # PNG仮定
    
    # Storage Clientを作成し、バケットにアクセス
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(filename)
    
    blob.upload_from_string(image_data, content_type="image/png")

    blob.make_public()  # <-- it might be controvrecial
    
    return blob.public_url


@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"


@app.route("/upload", methods=["POST"])
def upload():
    """
    ユーザーがBase64画像とテキストを送信した際のエンドポイント
    1. 画像をCloud Storageに保存
    2. Firestoreに画像URLとテキストを保存
    3. 固有のchat_idを生成し、/chat/<chat_id>にリダイレクト
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent."}), 400
    
    prompt_for_llm = "あなたはデザイナーのデザイン作成をサポートする専門家です。入力画像に対して以下の点から講評してください。①総合評価②色使い(明度と彩度、コントラストについて)③シルエットから見た全体のバランス④デザインの意外性⑤(入力画像がキャラクターの場合)キャラクターの性格予想。⑤については入力画像がキャラクターでは無い場合、回答しなくて良いです"

    base64_image = json_data.get("image")
    image_type_str = json_data.get("image_type")
    
    if not base64_image:
        return jsonify({"error": "No base64 image provided."}), 400
    
    # 1. 画像をCloud Storageに保存
    image_url = upload_image_to_cloud_storage(base64_image)
    
    # 2. Firestoreに保存
    # chat_idを生成
    chat_id = str(uuid.uuid4())
    
    # 例として "chats" コレクションにドキュメントを作成
    doc_ref = db.collection("chats").document(chat_id)
    doc_ref.set({
        "chat_id": chat_id,
        "messages": [
            {
                "image_url": image_url,
                "text": chat_text,
                "timestamp": datetime.now().isoformat()
            }
        ],
        "created_at": datetime.now().isoformat()
    })
    
    # 3. /chat/<chat_id>にリダイレクト
    # フロントエンド側でリダイレクトを制御する場合、JSONでURLを返すのも手です
    return jsonify({"redirect_url": f"/chat/{chat_id}"}), 200

@app.route("/chat/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    """
    固有IDを持つチャットルームを表示する例
    Firestoreからチャット情報を取得し、JSONで返す
    本来はHTMLテンプレートをレンダリングしたり、フロント側でチャットUIを実装
    """
    doc_ref = db.collection("chats").document(chat_id)
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({"error": "Chat not found"}), 404
    
    chat_data = doc.to_dict()
    return jsonify(chat_data), 200

@app.route("/chat/<chat_id>", methods=["POST"])
def post_chat_message(chat_id):
    """
    既存のチャットにメッセージを追加する例
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400
    
    new_text = data.get("text", "")
    new_image_base64 = data.get("base64_image")  # 画像があるかもしれない
    
    doc_ref = db.collection("chats").document(chat_id)
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({"error": "Chat not found"}), 404
    
    # 必要なら画像をアップロード
    new_image_url = None
    if new_image_base64:
        new_image_url = upload_image_to_cloud_storage(new_image_base64)
    
    # メッセージ追加
    doc_ref.update({
        "messages": firestore.ArrayUnion([
            {
                "text": new_text,
                "image_url": new_image_url,
                "timestamp": datetime.now().isoformat()
            }
        ])
    })
    
    return jsonify({"result": "Message added"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
