import os
import base64
import uuid
from datetime import datetime
from flask import Flask, request, redirect, url_for, jsonify
from google.cloud import storage
from google.cloud import firestore
from funcs import upload_image_to_cloud_storage

app = Flask(__name__)

db = firestore.Client()

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/upload", methods=["POST"])
def upload():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent."}), 400
    
    room_id = str(uuid.uuid4())
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
    
    base64_image = json_data.get("image")
    image_type_str = json_data.get("image_type")
    
    if not base64_image:
        return jsonify({"error": "No base64 image provided."}), 400
 
    upload_image_to_cloud
    
    
    
    _storage(base64_image, image_type_str, room_id)
  
    return jsonify({"firestore_id": f"{room_id}"}), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
