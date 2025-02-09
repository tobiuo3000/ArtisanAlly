import numpy as np
import cv2
import os
import uuid
from PIL import Image
import io
from google.oauth2.service_account import Credentials
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
from google.cloud import storage, firestore
import matplotlib.pyplot as plt

from flask import Flask, request, jsonify


"""
    room_id -> firestore -> cloud storage -> model -> uuid -> cloud storage -> firestore

    required: 1. firestore authentication
              2. flask endpoint
"""

client = storage.Client(credentials=cred)
  


def download_image_from_gcs(bucket_name, blob_name):
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    image_data = blob.download_as_string()
    print(f"Downloaded {blob_name} from bucket {bucket_name}")
    return image_data


def upload_image_to_gcs(image_array, bucket, destination_blob_name):
    success, encoded_image = cv2.imencode('.png', image_array)
    if not success:
        raise Exception("画像のエンコードに失敗しました")
    image_bytes = encoded_image.tobytes()
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(image_bytes, content_type='image/png')
    print(f"Uploaded image to {destination_blob_name}")



def load_and_process_image(image):
    if not isinstance(image, np.ndarray):
        image = np.array(image)
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    original_height, original_width, _ = image_bgr.shape
    aspect_ratio = original_height / original_width
    new_width = 256
    new_height = int(new_width * aspect_ratio)
    resized_image = cv2.resize(image_bgr, (new_width, new_height))
    return resized_image

def visualize_clusters(image_cls):
    num_clusters = np.max(image_cls)
    colors = np.random.randint(0, 255, (num_clusters + 1, 3))
    height, width = image_cls.shape
    color_image = np.zeros((height, width, 3), dtype=np.uint8)
    for i in range(1, num_clusters + 1):
        color_image[image_cls == i] = colors[i]
    return color_image

def create_heatmap_overlay(image, result, alpha=0.5):
    height, width = image.shape[:2]
    image = np.array(image, dtype=np.uint8)
    color_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # BytesIO にヒートマップを保存
    buf = io.BytesIO()
    plt.imshow(result, cmap='jet', alpha=alpha)
    plt.axis('off')
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close()
    buf.seek(0)
    heatmap_data = np.asarray(bytearray(buf.read()), dtype=np.uint8)
    heatmap = cv2.imdecode(heatmap_data, cv2.IMREAD_COLOR)
    heatmap = cv2.resize(heatmap, (width, height))
    overlay = cv2.addWeighted(color_image, 1-alpha, heatmap, alpha, 0)
    return overlay
def cluster_analysis(image, window_size=64):
    height, width = image.shape[:2]
    cluster_count_sum = np.zeros((height, width))
    window_count = np.zeros((height, width))
    for i in range(height - window_size + 1):
        for j in range(width - window_size + 1):
            window = image[i:i + window_size, j:j + window_size]
            unique_clusters = np.unique(window)
            cluster_count = len(unique_clusters)
            cluster_count_sum[i:i + window_size, j:j + window_size] += cluster_count
            window_count[i:i + window_size, j:j + window_size] += 1
    result = cluster_count_sum / window_count
    return result

def create_image_from_anns(anns):
    if len(anns) == 0:
        return None
    sorted_anns = sorted(anns, key=lambda x: x['area'], reverse=True)
    height, width = sorted_anns[0]['segmentation'].shape
    image_cls = np.zeros((height, width), dtype=int)
    for idx, ann in enumerate(sorted_anns):
        m = ann['segmentation']
        image_cls[m] = idx + 1
    return image_cls

def process(model_dir, image, window_size, points_per_side, pred_iou_thresh, stability_score_thresh, min_mask_region_area):
    # 入力画像が NumPy 配列か PIL.Image かでサイズ取得方法を分ける
    if isinstance(image, np.ndarray):
        height, width = image.shape[:2]
    else:
        width, height = image.width, image.height

    image_processed = load_and_process_image(image)
    image_processed = cv2.cvtColor(image_processed, cv2.COLOR_BGR2RGB)
    
    # チェックポイントとモデル設定（今回は vit_h を使用）
    sam_checkpoint = "/app/models/sam_vit_h_4b8939.pth"
    model_type = "vit_h"
    device = "cuda"  # Cloud Shell の場合 GPU がなければ "cpu" にa
    する  "cuda" 

    sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
    sam.to(device=device)

    mask_generator = SamAutomaticMaskGenerator(
        model=sam,
        points_per_side=points_per_side,
        pred_iou_thresh=pred_iou_thresh,
        stability_score_thresh=stability_score_thresh,
        crop_n_layers=1,
        crop_n_points_downscale_factor=2,
        min_mask_region_area=min_mask_region_area,
    )
    
    masks = mask_generator.generate(image_processed)
    image_cls = create_image_from_anns(masks)
    seg_mask = visualize_clusters(image_cls)
    result = cluster_analysis(image_cls, window_size)
    result = cv2.resize(result, (width, height))
    
    # ヒートマップ（2D の result を正規化してカラーマップ変換）
    norm = cv2.normalize(result, None, 0, 255, cv2.NORM_MINMAX)
    norm_uint8 = norm.astype(np.uint8)
    heat_map = cv2.applyColorMap(norm_uint8, cv2.COLORMAP_JET)
    
    overlay = create_heatmap_overlay(image_processed, result, alpha=0.5)
    return seg_mask, heat_map, overlay


def upload_image_to_gcs(image_array, bucket, destination_blob_name):
    # PNG形式にエンコード（cv2.imencode は BGR であることを前提）
    success, encoded_image = cv2.imencode('.png', image_array)
    if not success:
        raise Exception("画像のエンコードに失敗しました")
    image_bytes = encoded_image.tobytes()

    # 指定したパスにアップロード
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(image_bytes, content_type='image/png')
    print(f"Uploaded image to {destination_blob_name}")



app = Flask(__name__)

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route("/sam_api/", methods=["POST"])
def post():
    data = request.json
    room_id = data.get("room_id")
    db = firestore.Client()
    
    doc_snapshot = db.collection("rooms").document(room_id).get()
    firestore_dict = doc_snapshot.to_dict()
    if firestore_dict is None:
        return jsonify({"error": f"No document found for room_id: {room_id}"}), 400

    original_image_filename = firestore_dict.get("original_image_name")
    BUCKET_NAME = "artisanally_images"
    
    try:
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob("images/" + original_image_filename)
        image_data = blob.download_as_string()
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # SAM 処理用パラメータ
        window_size = 64 
        points_per_side = 64
        pred_iou_thresh = 0.88
        stability_score_thresh = 0.95
        min_mask_region_area = 50
        
        # model_dir はチェックポイントがある GCS もしくはローカルのディレクトリパス（ここでは PATH を使用）
        seg_mask, heatmap, overlay = process(PATH, image, window_size, points_per_side, pred_iou_thresh, stability_score_thresh, min_mask_region_area)
        
        file_type = "png"
        image_datas = [seg_mask, heatmap, overlay]
        image_names = ["seg_mask", "heatmap", "overlay"]
        doc_ref = db.collection("rooms").document(room_id)
        
        for i in range(3):
            image_id = str(uuid.uuid4())
            new_filename = f"{image_id}.{file_type}"
            destination_blob_name = f"images/{new_filename}"
            upload_image_to_gcs(image_array=image_datas[i], bucket=bucket, destination_blob_name=destination_blob_name)
            doc_ref.update({f"{image_names[i]}_image_name": new_filename})
        
        return jsonify({"status": 200})
    except Exception as e:
        return jsonify({"error": str(e)})





if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
    
 