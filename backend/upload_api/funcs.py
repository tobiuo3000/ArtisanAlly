import os
import base64
import uuid
from flask import Flask, request, redirect, url_for, jsonify
from google.cloud import storage
from google.cloud import firestore

BUCKET_NAME = "artisanally_images/images" 
db = firestore.Client()

def upload_image_to_cloud_storage(base64_image: str, file_type: str, room_id: str) -> None:
    """
    base64形式の画像データをCloud Storageにアップロードし、
    公開アクセス可能なURLを返すサンプル関数
    """
    # 例: "data:image/png;base64,..." のようなデータURL形式の場合は頭を切り取る
    if "," in base64_image:
        base64_image = base64_image.split(",")[1]
    
    if len(base64_image) < 10:  # for dammy data
        filename = f"{uuid.uuid4()}"
    else:
        image_data = base64.b64decode(base64_image)
        filename = f"{uuid.uuid4()}.{file_type}"
    
    # Storage Clientを作成し、バケットにアクセス
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(filename)
    
    blob.upload_from_string(image_data, content_type=f"image/{file_type}")

    doc_ref = db.collection("rooms").document(room_id)
    doc_ref.update({"original_image_name": filename})
    
    return None


if __name__ == "__main__":
    pass