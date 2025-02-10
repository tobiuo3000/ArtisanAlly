import uuid
from flask import Flask, request, redirect, url_for, jsonify
from google.cloud import storage
from google.cloud import firestore

BUCKET_NAME = "artisanally_images" 
db = firestore.Client()

def upload_image_to_cloud_storage(image_data, file_type: str, room_id: str) -> None:

    image_id = str(uuid.uuid4())
    filename = f"{image_id}.{file_type}"
    
    # Storage Clientを作成し、バケットにアクセス
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)

    blob = bucket.blob(f"images/{filename}")
    try:
        blob.upload_from_string(image_data, content_type=f"image/{file_type}")
    except Exception as e:
        print(e)
        return e

    doc_ref = db.collection("rooms").document(room_id)
    doc_ref.update({"original_image_name": filename})
    doc_ref.update({"file_type": file_type})
    
    return None


if __name__ == "__main__":
    pass