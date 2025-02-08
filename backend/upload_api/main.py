import os
import base64
import uuid
from datetime import datetime
from flask import Flask, request, redirect, url_for, jsonify
from google.cloud import storage
from google.cloud import firestore
from funcs import upload_image_to_cloud_storage
import numpy as np
import cv2

app = Flask(__name__)

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/upload/", methods=["POST"])
def upload():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent."}), 400
    
    room_id = str(uuid.uuid4())
    
    db = firestore.Client()

    doc_ref = db.collection("rooms").document(room_id)
    doc_ref.collection("chat_history")
    doc_ref.collection("rep_colors")
    doc_ref.set({
        "bucket_name": "artisanally_images",
        "original_image_name": None,
        "back_removed_image_name": None,
        "histogram_image_name": None,
        "heatmap_image_name": None,
        "main_commentary": None,
        "histogram_commentary": None,
        "heatmap_commentary": None,
        "created_at": datetime.now().isoformat()
    })
    
    base64_image = data.get("image")
    image_type_str = data.get("image_type")
    
    if not base64_image:
        return jsonify({"error": "No base64 image provided."}), 400

    image_stream = base64.b64decode(base64_image)
    #image_array = np.frombuffer(bytearray(image_stream), dtype=np.uint8)
    #image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    upload_image_to_cloud_storage(image_stream, image_type_str, room_id)

    return jsonify({"room_id": f"{room_id}"}), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
