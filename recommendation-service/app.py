from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection
import traceback
from recommendations import get_hybrid_recommendations, get_homepage_recommendations , get_content_based_recommendations

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

@app.route('/', methods=['GET'])
def health_check():
    try:
        print("🔍 / Endpoint hit - Health check in progress...")
        connection = get_db_connection()
        if connection:
            print("✅ Database connection inside endpoint successful!")
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM products")
            count = cursor.fetchone()[0]
            cursor.close()
            connection.close()
            return jsonify({
                "status": "success",
                "message": f"Recommendation Service is running! Products count: {count}"
            })
        else:
            print("❌ Database connection inside endpoint failed!")
            return jsonify({
                "status": "error",
                "message": "Database connection failed"
            }), 500
    except Exception as e:
        print(f"❌ Exception in health_check: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route('/product-recommendations', methods=['GET'])
def product_recommendations():
    product_id = request.args.get('product_id', type=int)
    top_n = request.args.get('limit', default=5, type=int)

    if not product_id:
        return jsonify({"error": "Missing product_id"}), 400

    recommendations = get_content_based_recommendations(product_id, top_n)
    return jsonify({"recommendations": recommendations})

@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    try:
        product_id = request.args.get('product_id', type=int)
        visitor_id = request.args.get('visitor_id')
        if not product_id:
            return jsonify({
                "status": "error",
                "message": "product_id is required"
            }), 400

        recommendations = get_hybrid_recommendations(product_id, visitor_id)
        if not recommendations:
            return jsonify({
                "status": "error",
                "message": f"No recommendations found for product_id {product_id}"
            }), 404

        return jsonify({
            "status": "success",
            "product_id": product_id,
            "visitor_id": visitor_id,
            "recommendations": recommendations
        })
    except Exception as e:
        print(f"❌ Exception in get_recommendations: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route('/homepage-recommendations', methods=['GET'])
def get_homepage_recommendations_endpoint():
    try:
        visitor_id = request.args.get('visitor_id')
        if not visitor_id:
            return jsonify({
                "status": "error",
                "message": "visitor_id is required"
            }), 400

        recommendations = get_homepage_recommendations(visitor_id)
        if not recommendations:
            return jsonify({
                "status": "error",
                "message": "No recommendations found"
            }), 404

        # ✅ FIXED: Return the structure that frontend expects
        # Frontend expects: { items: [...], type: "..." }
        # Not: { recommendations: [...], type: "..." }
        return jsonify({
            "status": "success",
            "visitor_id": visitor_id,
            "items": recommendations['items'],  # ✅ Changed from 'recommendations' to 'items'
            "type": recommendations['type']
        })
    except Exception as e:
        print(f"❌ Exception in get_homepage_recommendations: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Flask application...")

    try:
        print("🔌 Testing database connection at startup...")
        connection = get_db_connection()
        if connection:
            print("✅ Initial database test connection successful!")
            connection.close()
        else:
            print("❌ Initial database test connection failed!")

        print("🟢 Starting Flask server...")
        app.run(host='0.0.0.0', port=8001, debug=True)

    except Exception as e:
        print(f"❌ Error starting Flask server: {str(e)}")
        print(traceback.format_exc())

    input("Press Enter to exit...")