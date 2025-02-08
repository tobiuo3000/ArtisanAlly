import cv2
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
from google.cloud import firestore, storage
from funcs import upload_image_to_cloud_storage

def make_histogram(image, room_id="", db=None, bucket=None) -> None:
    # 画像をRGBに変換
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    mask = gray != 0  # 0ではないピクセルを対象にする
    
    hist_r = cv2.calcHist([image_rgb], [0], mask.astype(np.uint8), [256], [0, 256])
    hist_g = cv2.calcHist([image_rgb], [1], mask.astype(np.uint8), [256], [0, 256])
    hist_b = cv2.calcHist([image_rgb], [2], mask.astype(np.uint8), [256], [0, 256])
    
    hist_data = {
        "red": {str(i): 0 if i == 0 else int(hist_r[i][0]) for i in range(256)},
        "green": {str(i): 0 if i == 0 else int(hist_g[i][0]) for i in range(256)},
        "blue": {str(i): 0 if i == 0 else int(hist_b[i][0]) for i in range(256)}
    }
    
    doc_ref = db.collection("rooms").document(room_id)
    doc_ref.update({"histogram_data_array": hist_data})
    
    x_red = sorted([int(k) for k in hist_data["red"].keys()])
    y_red = [hist_data["red"][str(i)] for i in x_red]
    
    x_green = sorted([int(k) for k in hist_data["green"].keys()])
    y_green = [hist_data["green"][str(i)] for i in x_green]
    
    x_blue = sorted([int(k) for k in hist_data["blue"].keys()])
    y_blue = [hist_data["blue"][str(i)] for i in x_blue]
    
    plt.figure(figsize=(10, 4))
    plt.plot(x_red, y_red, color="red", label="Red")
    plt.plot(x_green, y_green, color="green", label="Green")
    plt.plot(x_blue, y_blue, color="blue", label="Blue")
    plt.xlim([0, 256])
    plt.xlabel("Pixel value")
    plt.ylabel("Frequency")
    plt.title("RGB Histogram (0除外)")
    plt.legend()
    
    buf = BytesIO()
    plt.savefig(buf, format="jpeg")
    plt.close()
    buf.seek(0)
    image_bytes = buf.getvalue()

    if image_bytes is None or len(image_bytes) == 0:
        raise ValueError("histogram image creation failed")
    else:
        print("Histogram image size:", len(image_bytes))
    
    upload_image_to_cloud_storage(
        image_bytes,
        file_type="jpeg",
        room_id=room_id,
        firestore_label="histogram_image_name",
        db=db,
        bucket=bucket
    )
