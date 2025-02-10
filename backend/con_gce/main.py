from flask import Flask, jsonify
import requests
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

COMPUTE_ENGINE_INTERNAL_IP = os.environ.get("COMPUTE_ENGINE_INTERNAL_IP", "10.140.0.4")
COMPUTE_ENGINE_PORT = os.environ.get("COMPUTE_ENGINE_PORT", "9090")


@app.route("/")
def hello_world():
    return jsonify(
        {"status": "hello world"}
    )

@app.route("/hello_engine/", methods=["POST"])
def hello():

    # compute engine ENDPOINT
    api_endpoint = f"http://10.140.0.4:9090/"
    
    try:
        data = request.json
        room_id = data.get("room_id")

        response = requests.get(api_endpoint)
        response.raise_for_status()

        return jsonify({"status": 200})

    except Exception as e:
        return jsonify({f"error": str(e)})

@app.route("/heatmap/", methods=["POST"])
def heat_map():

    # compute engine ENDPOINT
    api_endpoint = f"http://10.140.0.4:9090/sam_api/"
    
    try:
        data = request.json
        room_id = data.get("room_id")

        payload = {
        "room_id": room_id,
        }

        response = requests.post(api_endpoint, json=payload)
        response.raise_for_status()

        return jsonify({"status": 200})

    except Exception as e:
        return jsonify({f"error": str(e)})


if __name__ == "__main__":
    if False:
        app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))

    else:
        api_endpoint = f"http://{COMPUTE_ENGINE_INTERNAL_IP}:{COMPUTE_ENGINE_PORT}/"
        print(f"API Endpoint: {api_endpoint}")

        payload = {
        "room_id": "b5cf506d-a958-4abb-b41f-f77db5d8eb02",
        "key2": "value2"
        }


        response = requests.get(api_endpoint, timeout=3000)
        response.raise_for_status()
        print(response.text)

