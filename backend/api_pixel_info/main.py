from google.cloud import storage
from flask import Flask, request, jsonify
import os
import numpy as np
import cv2
from clustering import get_kmeans_clusters_sorted

app = Flask(__name__)
bucket_name = 'tekitou-test1209'
storage_client = storage.Client()
image_name = "sample_1212.jpg"

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/pixel_clutering/", methods=["GET"])
def post():

    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(image_name)
    image_data = blob.download_as_string()

    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    response = get_kmeans_clusters_sorted(img=img, num_clusters=20)
    
    
    return jsonify(response)



if __name__ == "__main__":
  
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
