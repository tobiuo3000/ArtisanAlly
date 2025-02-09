from flask import Flask, jsonify
import requests
import os

app = Flask(__name__)

COMPUTE_ENGINE_INTERNAL_IP = os.environ.get("COMPUTE_ENGINE_INTERNAL_IP", "34.81.9.41")
COMPUTE_ENGINE_PORT = os.environ.get("COMPUTE_ENGINE_PORT", "6789")


@app.route("/")
def hello_world():
    api_endpoint = f"http://{COMPUTE_ENGINE_INTERNAL_IP}:{COMPUTE_ENGINE_PORT}/"
    print(f"API Endpoint: {api_endpoint}")
    response = requests.get(api_endpoint, timeout=10)
    response.raise_for_status()
    print(response.text)
    return jsonify(
        {
            "status": "success",
            "message": f"Successfully connected to Compute Engine: {COMPUTE_ENGINE_INTERNAL_IP}:{COMPUTE_ENGINE_PORT}",
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
