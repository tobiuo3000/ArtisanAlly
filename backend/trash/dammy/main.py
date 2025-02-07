import os
import base64
import uuid
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"


@app.route("/upload", methods=["POST"])
def upload():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent."}), 400
    
    base64_image = data.get("image")
    image_type_str = data.get("image_type")
    
    if not base64_image:
        return jsonify({"error": "No base64 image provided."}), 400
    
    chat_id = str(uuid.uuid4())
    
    return jsonify({"room_id": f"{chat_id}"}), 200

@app.route("/upload_get_all_data", methods=["POST"])
def upload_all_data():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent."}), 400
    
    base64_image = data.get("image")
    image_type_str = data.get("image_type")
    
    if not base64_image:
        return jsonify({"error": "No base64 image provided."}), 400

    chat_id = "j1xs99a2ftshojouuuya"
    
    return jsonify({"room_id": f"{chat_id}"}), 200

@app.route("/upload_get_no_data", methods=["POST"])
def upload_no_data():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data sent."}), 400
    
    base64_image = data.get("image")
    image_type_str = data.get("image_type")
    
    if not base64_image:
        return jsonify({"error": "No base64 image provided."}), 400

    chat_id = "001fde8b-f551-42c0-9d64-695ee3a288da"
    
    return jsonify({"room_id": f"{chat_id}"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
