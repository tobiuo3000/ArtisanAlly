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
    json_data = request.json

    base64_image = json_data.get("image")
    image_type_str = json_data.get("image_type")
    image_stream = base64.b64decode(base64_image)
    image_array = np.frombuffer(bytearray(image_stream), dtype=np.uint8)
    image_without_background = remove(image_array, force_return_bytes=True)

    image_without_background_b64 = base64.b64encode(image_without_background).decode("utf-8")
    response = {'b64_image_without_background' : image_without_background_b64}
    
    return jsonify(response)



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
