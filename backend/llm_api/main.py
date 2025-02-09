from google.cloud import storage, firestore
from vertexai.generative_models import Part

import os
from flask import Flask, request, jsonify
import json
import numpy as np
import cv2
import base64
from commentary_llm import call_llm, commentary_histogram
from chat_llm import chat_llm
from datetime import datetime

app = Flask(__name__)

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/main_commentary/", methods=["POST"])
def first_commentary():
    data = request.json
    prompt_for_llm = "あなたはイラストレーターや画家、デザイナーをサポートする専門家です。入力画像に対して以下の点から講評してください。①総合評価②色使い(明度と彩度、コントラストについて)③シルエットから見た全体のバランス④デザインの意外性⑤(入力画像がキャラクターの場合)キャラクターの性格予想。⑤については入力画像がキャラクターでは無い場合、回答しなくて良いです。「はい、イラスト画像についてご指摘の点から講評いたします」「承知いたしました」などの冗長な言葉は不要です。チャット形式だということを意識しつつ、冗長な表現を避けて簡潔に回答を完成させてください"

    room_id = data.get("room_id")

    try:
        db = firestore.Client()

        doc_snapshot = db.collection("rooms").document(room_id).get()
        firestore_dict = doc_snapshot.to_dict()  
        if firestore_dict is None:
            raise ValueError(f"No document found for room_id: {room_id}")

        original_image_filename = firestore_dict.get("original_image_name")

        response_of_llm = call_llm(image_filename=original_image_filename, prompt=prompt_for_llm)

        new_user_document_name = "user0"
        new_agent_document_name = "agent0"

        doc_ref = db.collection("rooms").document(room_id).collection("chat_history").document(new_user_document_name)
        doc_ref.set({
            "sender": "user",
            "text": prompt_for_llm,
            "created_at": datetime.now().isoformat()
        })
        doc_ref = db.collection("rooms").document(room_id).collection("chat_history").document(new_agent_document_name)
        doc_ref.set({
            "sender": "agent",
            "text": response_of_llm,
            "created_at": datetime.now().isoformat()
        })

        #return jsonify({f"response": response_of_llm})
        return jsonify({"status": 200})
    
    except Exception as e:
        return jsonify({f"error": str(e)})


@app.route("/histogram_commentary/", methods=["POST"])
def second_commentary():
    data = request.json
    prompt_for_llm = "あなたはイラストレーターや画家、デザイナーのサポートする専門家です。入力データはrgbイラストに対するヒストグラムのデータです。①ヒストグラムの見方をイラストレータにもわかるように短く説明してください②ヒストグラムから予想される元画像の特徴を短く説明してください③それぞれの色の分布から、イラストレータや画家にとって参考となるアドバイスを与えてください"

    room_id = data.get("room_id")

    try:
        db = firestore.Client()
        doc_snapshot = db.collection("rooms").document(room_id).get()
        hist_data = doc_snapshot.get("histogram_data_array")
        
        red_map = hist_data.get("red")
        green_map = hist_data.get("green")
        blue_map = hist_data.get("blue")

        red_array = [int(red_map.get(str(i), 0)) for i in range(256)]
        green_array = [int(green_map.get(str(i), 0)) for i in range(256)]
        blue_array = [int(blue_map.get(str(i), 0)) for i in range(256)]

        histogram_dict = {
            "red": red_array,
            "green": green_array,
            "blue": blue_array
        }
        
        histogram_str = json.dumps(histogram_dict, ensure_ascii=False)

        response = commentary_histogram(histogram_str, prompt_for_llm)

        Part.from_text("Histogram data: " + histogram_str)


        

        doc_ref = db.collection("rooms").document(room_id)
        doc_ref.update({
            "histogram_commentary": response,
        })


        return jsonify({f"status": 200})
    
    except Exception as e:
        return jsonify({f"error": str(e)})


@app.route("/heatmap_commentary/", methods=["POST"])
def third_commentary():
    data = request.json
    prompt_for_llm = "あなたはイラストレーターや画家、デザイナーのデザイン作成をサポートする専門家です。入力データはイラストに対する情報量のヒートマップです。数値が高いところはオブジェクトが多く密集していると考えられます。①ヒートマップの見方をイラストレータにもわかるように短く説明してください②ヒストグラムから予想される元画像の特徴を短く説明してください③分布から、イラストレータや画家にとって参考となるアドバイスを与えてください"

    room_id = data.get("room_id")

    try:
        db = firestore.Client()

        doc_snapshot = db.collection("rooms").document(room_id).get()
        firestore_dict = doc_snapshot.to_dict()
        if firestore_dict is None:
            raise ValueError(f"No document found for room_id: {room_id}")

        original_image_filename = firestore_dict.get("heatmap_image_name")

        response_of_llm = call_llm(image_filename=original_image_filename, prompt=prompt_for_llm)

        return jsonify({f"status": 200})
    
    except Exception as e:
        return jsonify({f"error": str(e)})
    


@app.route("/chat/", methods=["POST"])
def chat_with_ai():
    data = request.json

    room_id = data.get("room_id")
    new_message = data.get("user_message")
    
    db = firestore.Client()

    try:
        doc_snapshot = db.collection("rooms").document(room_id).get()
        firestore_dict = doc_snapshot.to_dict()   
        if firestore_dict is None:
            raise ValueError(f"No document found for room_id: {room_id}")

        original_image_filename = firestore_dict.get("original_image_name")
        original_part_object = {
            "role": "user",
            "parts": [
                Part.from_uri(
                    f"https://storage.googleapis.com/artisanally_images/images/{original_image_filename}",
                    mime_type="image/jpeg",
                ).to_dict()
            ]
        }


        len_chat_history = len(list(db.collection("rooms").document(room_id).collection("chat_history").stream()))
        
        chats = db.collection("rooms").document(room_id).collection("chat_history").order_by("created_at").stream()
        
        agent_answer = chat_llm(original_part_object=original_part_object, new_message=new_message, len_chat_history=len_chat_history, room_id=room_id, chats=chats)

        # add new_message to chat_history "after" chat history is collected

        new_user_document_name = f"user{int(len_chat_history/2)}"
        new_agent_document_name = f"agent{int(len_chat_history/2)}"

        doc_ref = db.collection("rooms").document(room_id).collection("chat_history").document(new_user_document_name)
        doc_ref.set({
            "sender": "user",
            "text": new_message,
            "created_at": datetime.now().isoformat()
        })
        doc_ref = db.collection("rooms").document(room_id).collection("chat_history").document(new_agent_document_name)
        doc_ref.set({
            "sender": "agent",
            "text": agent_answer,
            "created_at": datetime.now().isoformat()
        })

        return jsonify({f"status": 200})

    except Exception as e:    
        return jsonify({"error": str(e)})




if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
