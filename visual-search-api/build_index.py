import os
import torch
import clip
import faiss
import pickle
import numpy as np
from PIL import Image

# ✅ Load the CLIP model
model, preprocess = clip.load("ViT-B/32")
device = "cpu"

# ✅ Path to your React image folder
IMAGE_DIR = "../intellicart-react/public/assets/images"
index_data = []
paths = []
categories = []

# ✅ Walk through all image files in category folders
for root, _, files in os.walk(IMAGE_DIR):
    category = os.path.basename(root) if root != IMAGE_DIR else "Uncategorized"
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            path = os.path.join(root, file)
            try:
                image = preprocess(Image.open(path)).unsqueeze(0).to(device)
                with torch.no_grad():
                    vec = model.encode_image(image).cpu().numpy()[0]
                    # Normalize embedding for cosine similarity
                    vec = vec / np.linalg.norm(vec)
                index_data.append(vec)

                # Store relative path like: assets/images/Electronics/Headphones.jpg
                relative_path = os.path.relpath(path, "../intellicart-react/public")
                paths.append(relative_path.replace("\\", "/"))  # Windows fix
                categories.append(category)
            except Exception as e:
                print(f"❌ Skipping: {path} | Error: {e}")

# ✅ Build the FAISS index for cosine similarity
print(f"✅ Indexed {len(index_data)} images.")
index = faiss.IndexFlatIP(512)  # Inner Product for cosine similarity
index.add(torch.tensor(index_data).numpy())

# ✅ Save index and path mapping with categories
faiss.write_index(index, "image_index.faiss")
with open("image_map.pkl", "wb") as f:
    pickle.dump({"paths": paths, "categories": categories}, f)

print("✅ Done: FAISS index and image_map.pkl created.")