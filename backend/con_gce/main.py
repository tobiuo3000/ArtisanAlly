from flask import Flask, jsonify
import requests
import os

app = Flask(__name__)

COMPUTE_ENGINE_INTERNAL_IP = os.environ.get("COMPUTE_ENGINE_INTERNAL_IP", "10.140.0.4")
COMPUTE_ENGINE_PORT = os.environ.get("COMPUTE_ENGINE_PORT", "9090")


@app.route("/")
def hello_world():
    api_endpoint = f"http://{COMPUTE_ENGINE_INTERNAL_IP}:{COMPUTE_ENGINE_PORT}/sam_api/"
    print(f"API Endpoint: {api_endpoint}")

    payload = {
    "room_id": "b5cf506d-a958-4abb-b41f-f77db5d8eb02",
    "key2": "value2"
    }


    response = requests.post(api_endpoint, json=payload, timeout=3000)
    response.raise_for_status()
    print(response.text)
    return jsonify(
        {
            "status": "success",
            "message": f"Successfully connected to Compute Engine: {COMPUTE_ENGINE_INTERNAL_IP}:{COMPUTE_ENGINE_PORT}",
        }
    )


"""
curl -X POST http://localhost:8080/your_endpoint \
     -H "Content-Type: application/json" \
     -d '{"room_id": ""}'
"""


if __name__ == "__main__":
    if True:
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

