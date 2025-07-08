/* eslint-disable no-restricted-globals, no-undef */
// public/visualSearchWorker.js

// Solution for importScripts warning - we'll declare it in ESLint config
// For now, we'll disable the specific warning for this file

// Load TensorFlow and MobileNet libraries
try {
  importScripts(
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js",
    "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0"
  );
} catch (error) {
  console.error("Failed to load required scripts:", error);
  throw new Error("Worker initialization failed - could not load dependencies");
}

// Get references to the loaded libraries
const tf = self.tf;
const mobilenet = self.mobilenet;

let model = null;
let isInitialized = false;

/**
 * Loads the MobileNet model
 * @returns {Promise<boolean>} True if successful
 */
async function loadModel() {
  if (isInitialized) return true;

  try {
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Model loading failed in worker:", error);
    isInitialized = false;
    return false;
  }
}

/**
 * Extracts features from an image using the loaded model
 * @param {ImageData} imageData - The image data to process
 * @returns {Promise<Array<number>>} Extracted features array
 */
async function extractFeatures(imageData) {
  if (!isInitialized) {
    throw new Error("Model not initialized");
  }

  try {
    const imageTensor = tf.browser.fromPixels(imageData);
    const processed = tf.image
      .resizeBilinear(imageTensor, [224, 224])
      .div(255.0)
      .expandDims(0);
    const features = model.infer(processed, "conv_preds");
    const result = await features.array();

    // Cleanup tensors to prevent memory leaks
    tf.dispose([imageTensor, processed, features]);

    return result[0];
  } catch (error) {
    console.error("Feature extraction failed in worker:", error);
    throw error;
  }
}

// Handle incoming messages
self.onmessage = async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "INIT":
      try {
        const success = await loadModel();
        self.postMessage({
          type: "INIT_DONE",
          success,
          message: success
            ? "Model loaded successfully"
            : "Model loading failed",
        });
      } catch (error) {
        self.postMessage({
          type: "ERROR",
          error: "Model initialization failed",
          details: error.message,
        });
      }
      break;

    case "EXTRACT_FEATURES":
      try {
        if (!isInitialized) {
          throw new Error("Model not initialized - call INIT first");
        }

        const features = await extractFeatures(data.imageData);
        self.postMessage({
          type: "FEATURES_EXTRACTED",
          features,
          requestId: data.requestId,
        });
      } catch (error) {
        self.postMessage({
          type: "ERROR",
          error: "Feature extraction failed",
          details: error.message,
          requestId: data.requestId,
        });
      }
      break;

    case "PING":
      self.postMessage({
        type: "PONG",
        isInitialized,
        timestamp: Date.now(),
      });
      break;

    default:
      self.postMessage({
        type: "ERROR",
        error: "Unknown command",
        receivedType: type,
      });
      break;
  }
};
