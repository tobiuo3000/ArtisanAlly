import os
from flask import Flask, request, jsonify
import numpy as np
import cv2
import base64
from call_llm import call_llm

app = Flask(__name__)

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/image/", methods=["POST"])
def post():
    # レスポンスはリストにする(今後複数のレスポンスを返すことを想定)
    response = []
    json = request.json
    prompt_for_llm = "あなたはデザイナーのデザイン作成をサポートする専門家です。入力画像に対して以下の点から講評してください。①総合評価②色使い(明度と彩度、コントラストについて)③シルエットから見た全体のバランス④デザインの意外性⑤(入力画像がキャラクターの場合)キャラクターの性格予想。⑤については入力画像がキャラクターでは無い場合、回答しなくて良いです"

    base64_image = json.get("image")
    image_type_str = json.get("image_type")
    """
    img_stream = base64.b64decode(encoded_image)
    img_array = np.frombuffer(bytearray(img_stream), dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    """
     
    response_of_llm = call_llm(image=base64_image, image_type=image_type_str, prompt=prompt_for_llm)

    response.append({'response' : response_of_llm})
    
    return jsonify(response)

@app.route("/llm/", methods=["get"])
def get_response():
    response = call_llm()
    return response



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
