from flask import Flask, request, jsonify
from rembg import remove
import os
import numpy as np
import cv2
import base64

app = Flask(__name__)

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/background_removal/", methods=["POST"])
def post():
    json = request.json

    response = []
    encoded_image = json.get("image")
    image_type_str = json.get("image_type")
    img_stream = base64.b64decode(encoded_image).decode('utf-8')
    img_array = np.frombuffer(bytearray(img_stream), dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    image_without_background = remove(image)
    
    image_without_background_b64 = base64.b64encode(image_without_background)
    response.append({'image_without_background_b64' : image_without_background_b64})
    
    return jsonify(response)
    