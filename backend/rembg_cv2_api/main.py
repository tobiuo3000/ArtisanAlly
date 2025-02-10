from google.cloud import storage, firestore
import os
from flask import Flask, request, jsonify
import numpy as np
import cv2
import base64
from rembg import remove
from clustering import calc_kmeans_clusters_sorted
from funcs import upload_image_to_cloud_storage
from histogram import make_histogram

app = Flask(__name__)

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/background_removal/", methods=["POST"])
def removal_post():
    BUCKET_NAME = "artisanally_images"
    db = firestore.Client()

    try:
        data = request.json
        room_id = data.get("room_id")

        if type(room_id) != str:
            raise ValueError(f"request json error: {room_id}")

        doc_snapshot = db.collection("rooms").document(room_id).get()
        firestore_dict = doc_snapshot.to_dict()   # ドキュメント全体のデータを辞書として取得
        if firestore_dict is None:
            raise ValueError(f"No document found for room_id: {room_id}")

        original_image_filename = firestore_dict.get("original_image_name")
        
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)

        blob = bucket.blob(f"images/{original_image_filename}")
        original_image_stream = blob.download_as_string()
        image_array = np.frombuffer(bytearray(original_image_stream), dtype=np.uint8)

        image_without_background_bytes = remove(image_array, force_return_bytes=True)
        if not image_without_background_bytes:
            raise ValueError("background removal failed.")
        #ret, buffer = cv2.imencode('.png', image_without_background_bytes)
        #image_without_background_bytes = buffer.tobytes()

        upload_image_to_cloud_storage(image_data=image_without_background_bytes, file_type="png", room_id=room_id, firestore_label="back_removed_image_name", db=db, bucket=bucket)
        
        #nparr = np.frombuffer(image_without_background_bytes, np.uint8)
        #image_without_background = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        image_imdecoded = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        calc_kmeans_clusters_sorted(image=image_imdecoded, num_clusters=20, room_id=room_id, db=db)
        make_histogram(image=image_imdecoded, room_id=room_id, db=db, bucket=bucket)

        return jsonify({"status": "200"})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.config['PROPAGATE_EXCEPTIONS'] = True
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))