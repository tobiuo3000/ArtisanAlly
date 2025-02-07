import os
import base64
import uuid
from datetime import datetime
from flask import Flask, request, redirect, url_for, jsonify
from google.cloud import storage
from google.cloud import firestore

app = Flask(__name__)

db = firestore.Client()

room_id = str(uuid.uuid4())
BUCKET_NAME = "artisanally_images"

# Storage Clientを作成し、バケットにアクセス
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)
image_id = str(uuid.uuid4())
filename = f"{image_id}.txt"
blob = bucket.blob(f"images/{filename}")

try:
    blob.upload_from_string("hahaha", content_type="text/plain")
except Exception as e:
    print(e)


if __name__ == "__main__":
    pass
