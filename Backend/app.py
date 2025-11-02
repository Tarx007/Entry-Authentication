import os
import cv2
import torch
import pickle
import base64
import numpy as np
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
from PIL import Image
from facenet_pytorch import InceptionResnetV1, MTCNN
from ultralytics import YOLO

# -----------------------------------------------------------
# CONFIG
# -----------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database" / "face_db.pkl"
os.makedirs(DB_PATH.parent, exist_ok=True)

VERIFY_THRESHOLD = 0.9

# -----------------------------------------------------------
# INIT
# -----------------------------------------------------------
app = Flask(__name__)
CORS(app)

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
mtcnn = MTCNN(keep_all=False, device=device)

# -----------------------------------------------------------
# LOAD DATABASE
# -----------------------------------------------------------
if DB_PATH.exists():
    with open(DB_PATH, "rb") as f:
        face_db = pickle.load(f)
else:
    face_db = {}

def save_db():
    with open(DB_PATH, "wb") as f:
        pickle.dump(face_db, f)

# -----------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------
def read_cv2_image(file_storage):
    data = np.frombuffer(file_storage.read(), np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    return img

def get_embedding_bgr(image_bgr):
    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    face_tensor = mtcnn(pil_img)
    if face_tensor is None:
        return None
    with torch.no_grad():
        emb = resnet(face_tensor.unsqueeze(0).to(device))
        emb = emb.cpu().numpy()[0].astype(np.float32)
    n = np.linalg.norm(emb)
    if n == 0:
        return None
    return emb / n

def l2_distance(a, b):
    return float(np.linalg.norm(a - b))

def verify_face(emb, stored_emb, threshold=VERIFY_THRESHOLD):
    return l2_distance(emb, stored_emb) < threshold

# -----------------------------------------------------------
# ROUTES
# -----------------------------------------------------------
@app.route('/api/enroll', methods=['POST'])
def enroll():
    user_id = request.form.get("user_id")
    full_name = request.form.get("full_name")
    file = request.files.get("image")

    if not user_id or not full_name:
        return jsonify({"error": "Missing user_id or full_name"}), 400

    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    # Read image
    image = read_cv2_image(file)
    if image is None:
        return jsonify({"error": "Invalid image format"}), 400

    # Get embedding
    emb = get_embedding_bgr(image)
    if emb is None:
        return jsonify({"error": "No face detected"}), 400

    # Save embedding
    face_db[user_id] = emb
    save_db()

    # Optionally, save image to disk for reference
    save_path = rf"C:\Users\TARUN REDDY\Downloads\fa\Backend\database\{user_id}.jpg"

    cv2.imwrite(str(save_path), image)

    return jsonify({"message": f"User {user_id} enrolled successfully"}), 200

@app.route("/api/verify", methods=["POST"])
def verify():
    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID missing"}), 400
    if user_id not in face_db:
        return jsonify({"error": "User not found"}), 404

    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    image = read_cv2_image(file)
    emb = get_embedding_bgr(image)
    if emb is None:
        return jsonify({"error": "No face detected"}), 400

    match = verify_face(emb, face_db[user_id])
    if match:
        return jsonify({"status": "success", "message": "Face verified"}), 200
    else:
        return jsonify({"status": "failed", "message": "Face mismatch"}), 401

@app.route("/api/users", methods=["GET"])
def users():
    return jsonify({"users": list(face_db.keys())}), 200

@app.route("/api/delete", methods=["DELETE"])
def delete_user():
    user_id = request.args.get("user_id")
    if not user_id or user_id not in face_db:
        return jsonify({"error": "User not found"}), 404
    del face_db[user_id]
    save_db()
    return jsonify({"message": f"User '{user_id}' deleted"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
