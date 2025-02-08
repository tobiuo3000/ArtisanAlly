import uuid
from flask import Flask, request, redirect, url_for, jsonify
from google.cloud import storage
from google.cloud import firestore


def upload_image_to_cloud_storage(image_data, file_type: str, room_id: str, firestore_label: str, db, bucket) -> None:

    image_id = str(uuid.uuid4())
    new_filename = f"{image_id}.{file_type}"
    blob = bucket.blob(f"images/{new_filename}")

    if blob is None:
        raise ValueError("blob loading error")
    try:
        blob.upload_from_string(image_data, content_type=f"image/{file_type}")
    except GoogleCloudError as gce:
        # Google Cloud固有のエラーをキャッチして詳細な情報を含める
        raise Exception(f"Failed to upload image to Cloud Storage due to a Google Cloud error. File: {new_filename}, Error: {gce}")
    except Exception as e:
        raise Exception(f"Failed to upload image to Cloud Storage. File: {new_filename}, Error: {e}")

    doc_ref = db.collection("rooms").document(room_id)
    doc_ref.update({firestore_label: new_filename})
    
    return None


if __name__ == "__main__":
    pass