from google.cloud import storage
import os
import numpy as np
import cv2

def get_kmeans_clusters_sorted(img, num_clusters=20) -> list:
    # 画像を (画素数, 3) の形状に変換し、float32型にキャスト
    data = img.reshape(-1, 3).astype(np.float32)

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
    return sorted_centers

