from google.cloud import storage, firestore
import numpy as np
import cv2


def calc_kmeans_clusters_sorted(image, num_clusters=20, room_id="", db=None) -> None:
    # 画像を (画素数, 3) の形状に変換し、float32型にキャスト
    data = image.reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)

    ret, labels, centers = cv2.kmeans(
        data,
        num_clusters,
        None,
        criteria,
        attempts=10,
        flags=cv2.KMEANS_RANDOM_CENTERS
    )

    centers = centers.astype(np.uint8)  # float32 -> uint8

    #  (shape: (N, 1))
    labels = labels.squeeze()  # shape: (N,)

    unique_labels, counts = np.unique(labels, return_counts=True)
    sorted_indices = np.argsort(counts)[::-1]
    sorted_centers = centers[sorted_indices].tolist()

    doc_ref = db.collection("rooms").document(room_id)
    rep_colors = [
        {"r": int(color[0]), "g": int(color[1]), "b": int(color[2])}
        for color in sorted_centers
    ]
    doc_ref.update({"rep_colors": rep_colors})
        
    return None
