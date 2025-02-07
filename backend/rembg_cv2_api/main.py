import os
from flask import Flask, request, jsonify
import numpy as np
import cv2
import base64
from rembg import remove
from call_llm import call_llm

app = Flask(__name__)
BUCKET_NAME = "artisanally_images/images"
db = firestore.Client()

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/background_removal/", methods=["POST"])
def post():
    data = request.json
    room_id = data.get("room_id")

    doc_snapshot = db.collection("rooms").document(room_id).get()
    data = doc_snapshot.to_dict()   # ドキュメント全体のデータを辞書として取得
    filename = data.get("original_image_name")

    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(filename)
    image_data = blob.download_as_string()
    image_array = np.frombuffer(bytearray(image_data), dtype=np.uint8)
    image_without_background = remove(image_array, force_return_bytes=True)

    backremoved_filename = f"{uuid.uuid4()}.png"
    new_blob = bucket.blob(backremoved_filename)

    new_blob.upload_from_string(image_without_background, content_type="image/png")

    doc_ref = db.collection("rooms").document(room_id)
    doc_ref.update({"original_image_name": backremoved_filename})

    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    color_clusters_list = get_kmeans_clusters_sorted(img=img, num_clusters=20)


    return None


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
