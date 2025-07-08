from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import clip
import faiss
import pickle
import os
import numpy as np

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Load the CLIP model
model, preprocess = clip.load("ViT-B/32")
device = "cpu"

# Load FAISS index and image-to-path map
index = faiss.read_index("image_index.faiss")
with open("image_map.pkl", "rb") as f:
    image_map = pickle.load(f)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route("/search", methods=["POST"])
def search():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        file = request.files["image"]
        image = preprocess(Image.open(file)).unsqueeze(0).to(device)

        with torch.no_grad():
            vec = model.encode_image(image).cpu().numpy()[0]
            # Normalize embedding for cosine similarity
            vec = vec / np.linalg.norm(vec)

        distances, indices = index.search(vec.reshape(1, -1), 20)

        print("🔍 Cosine Similarities:", distances[0])
        print("📌 Indices:", indices[0])
        print("📷 Image paths returned from FAISS index:")
        for i in indices[0]:
            if 0 <= i < len(image_map["paths"]):
                print(f"Image {i}: {image_map['paths'][i]} (Category: {image_map['categories'][i]})")

        # Convert cosine similarity to percentage (0-100), ensuring no negative values
        matches = [
            {
                "image": image_map["paths"][i],
                "category": image_map["categories"][i],
                "score": float(distances[0][j]),
                "similarity": max(0, round(float(distances[0][j]) * 100, 1))  # Ensure non-negative percentage
            }
            for j, i in enumerate(indices[0])
            if 0 <= i < len(image_map["paths"])
        ]

        if not matches:
            return jsonify({"error": "No matches found"}), 404

        print("✅ Matches found:")
        for match in matches:
            print(f"Matched Image: {match['image']} with Score: {match['score']} (Similarity: {match['similarity']}%, Category: {match['category']})")

        return jsonify({"results": matches})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/update-embedding", methods=["POST"])
def update_embedding():
    try:
        data = request.get_json()
        relative_path = data.get("image_path")  # e.g. "/assets/images/Electronics/myimage.jpg"

        if not relative_path:
            return jsonify({"status": "error", "message": "Image path is required"}), 400

        # Convert public path to filesystem path
        absolute_path = os.path.abspath(
            os.path.join("../intellicart-react/public", relative_path.lstrip("/"))
        )

        if not os.path.exists(absolute_path):
            return jsonify({"status": "error", "message": f"Image not found: {absolute_path}"}), 404

        print("📦 Updating Visual Search Embedding...")
        print("📸 Image path:", relative_path)
        print("🧠 Encoding image and adding to FAISS...")

        image = preprocess(Image.open(absolute_path)).unsqueeze(0).to(device)
        with torch.no_grad():
            vec = model.encode_image(image).cpu().numpy()[0]
            # Normalize embedding for cosine similarity
            vec = vec / np.linalg.norm(vec)

        index.add(vec.reshape(1, -1))
        image_map["paths"].append(relative_path)
        image_map["categories"].append(os.path.basename(os.path.dirname(absolute_path)))

        # Save updated index and image map
        faiss.write_index(index, "image_index.faiss")
        with open("image_map.pkl", "wb") as f:
            pickle.dump(image_map, f)

        print("✅ Embedding added to FAISS.")
        print("🗺️ Image map updated with:", relative_path)
        print("🧾 Current FAISS index size:", index.ntotal)

        return jsonify({"status": "success", "message": "Embedding updated"})

    except Exception as e:
        print("❌ Error updating embedding:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000)