import pymysql
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from database import get_db_connection
import numpy as np
from cachetools import TTLCache
import time
import json
from collections import defaultdict, Counter

TRENDING_CACHE = TTLCache(maxsize=1, ttl=60)  # 2 minutes cache
CACHE_KEY = "trending_products:7days"

def get_product_details():
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(pymysql.cursors.DictCursor)
            cursor.execute("""
                SELECT 
                    pd.id,
                    pd.description,
                    pd.features,
                    pd.specifications,
                    p.name,
                    p.category
                FROM product_details pd
                JOIN products p ON pd.id = p.id
            """)
            products = cursor.fetchall()
            cursor.close()
            connection.close()
            return products
        except Exception as e:
            print(f"Error fetching product details: {e}")
            return []
    return []

def get_user_interactions(visitor_id):
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(pymysql.cursors.DictCursor)
            cursor.execute("""
                SELECT visitor_id, item_id, event_type, created_at
                FROM interactions
                WHERE visitor_id = %s AND created_at >= NOW() - INTERVAL 30 DAY
            """, (visitor_id,))
            interactions = cursor.fetchall()
            cursor.close()
            connection.close()
            return interactions
        except Exception as e:
            print(f"Error fetching interactions: {e}")
            return []
    return []

def get_collaborative_recommendations(visitor_id, top_n=5):
    interactions = get_user_interactions(visitor_id)
    if not interactions:
        return []

    visitor_items = {}
    for interaction in interactions:
        visitor = interaction['visitor_id']
        item = interaction['item_id']
        event = interaction['event_type']
        weight = 1 if event == 'view' else 2 if event == 'add_to_cart' else 3 if event == 'order' else 0
        if visitor not in visitor_items:
            visitor_items[visitor] = {}
        visitor_items[visitor][item] = visitor_items[visitor].get(item, 0) + weight

    if visitor_id not in visitor_items or not visitor_items[visitor_id]:
        return []

    visitor_items_list = list(visitor_items.items())
    visitor_indices = {visitor: idx for idx, (visitor, _) in enumerate(visitor_items_list)}
    item_indices = {item: idx for idx, item in enumerate(set(item for visitor_dict in visitor_items.values() for item in visitor_dict))}

    n_visitors = len(visitor_items)
    n_items = len(item_indices)
    matrix = np.zeros((n_visitors, n_items))
    for visitor, items in visitor_items.items():
        for item, weight in items.items():
            matrix[visitor_indices[visitor]][item_indices[item]] = weight

    visitor_similarity = cosine_similarity(matrix)
    similar_visitors = visitor_similarity[visitor_indices[visitor_id]].argsort()[::-1][1:top_n+1]

    recommended_items = {}
    for sim_visitor_idx in similar_visitors:
        sim_visitor = list(visitor_items.keys())[sim_visitor_idx]
        for item, weight in visitor_items[sim_visitor].items():
            if item not in visitor_items[visitor_id]:
                recommended_items[item] = recommended_items.get(item, 0) + weight * visitor_similarity[visitor_indices[visitor_id]][sim_visitor_idx]

    sorted_recommendations = sorted(recommended_items.items(), key=lambda x: x[1], reverse=True)
    return [{"product_id": item, "score": float(score)} for item, score in sorted_recommendations[:top_n]]

def get_content_based_recommendations(product_id, top_n=5):
    products = get_product_details()
    if not products:
        return []

    product_ids = [prod['id'] for prod in products]
    if product_id not in product_ids:
        return []

    # Get current product category
    current_category = None
    for prod in products:
        if prod['id'] == product_id:
            current_category = prod.get('category')
            break

    # Filter products of same category only
    if current_category:
        products = [prod for prod in products if prod.get('category') == current_category]
        product_ids = [prod['id'] for prod in products]

    # Weighted text composition (manual field weighting)
    texts = [
        f"{prod.get('name', '')} " * 3 +
        f"{prod.get('category', '')} " * 2 +
        f"{prod.get('description', '')} " +
        f"{prod.get('features', '')}"
        for prod in products
    ]

    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = tfidf.fit_transform(texts)

    if product_id not in product_ids:
        return []

    idx = product_ids.index(product_id)
    cosine_sim = cosine_similarity(tfidf_matrix[idx:idx+1], tfidf_matrix)

    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:top_n+1]  # skip same product

    product_indices = [i[0] for i in sim_scores]

    return [
        {
            "product_id": product_ids[i],
            "score": float(sim_scores[j][1])
        }
        for j, i in enumerate(product_indices)
    ]
def get_hybrid_recommendations(product_id, visitor_id=None, top_n=5):
    content_recs = get_content_based_recommendations(product_id, top_n)
    collab_recs = get_collaborative_recommendations(visitor_id, top_n) if visitor_id else []

    all_recs = {}
    for rec in content_recs:
        all_recs[rec['product_id']] = all_recs.get(rec['product_id'], 0) + rec['score'] * 0.7
    for rec in collab_recs:
        all_recs[rec['product_id']] = all_recs.get(rec['product_id'], 0) + rec['score'] * 0.4

    sorted_recs = sorted(all_recs.items(), key=lambda x: x[1], reverse=True)
    return [{"product_id": item, "score": float(score)} for item, score in sorted_recs[:top_n]]

def get_trending_products(top_n=10):
    if CACHE_KEY in TRENDING_CACHE:
        return TRENDING_CACHE[CACHE_KEY]

    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(pymysql.cursors.DictCursor)
            cursor.execute("""
                SELECT 
                    p.id AS product_id, 
                    p.name, 
                    p.price, 
                    p.image, 
                    p.category,
                    SUM(CASE 
                        WHEN i.event_type = 'view' THEN 1
                        WHEN i.event_type = 'add_to_cart' THEN 2
                        WHEN i.event_type = 'order' THEN 3
                        ELSE 0
                    END) AS engagement_score
                FROM products p
                LEFT JOIN interactions i ON p.id = i.item_id
                WHERE i.created_at >= NOW() - INTERVAL 7 DAY OR i.created_at IS NULL
                GROUP BY p.id, p.name, p.price, p.image, p.category
                ORDER BY engagement_score DESC
                LIMIT %s
            """, (top_n,))
            products = cursor.fetchall()
            cursor.close()
            connection.close()

            result = [{
                "product_id": p['product_id'],
                "name": p['name'],
                "price": float(p['price']),
                "image": p['image'],
                "category": p['category'],
                "score": float(p['engagement_score'] or 0)
            } for p in products]

            TRENDING_CACHE[CACHE_KEY] = result
            return result
        except Exception as e:
            print(f"Error fetching trending products: {e}")
            return []
    return []

def get_homepage_recommendations(visitor_id, top_n=10):
    INTERACTION_THRESHOLD = 5
    interactions = get_user_interactions(visitor_id)
    interaction_count = len(interactions)

    if interaction_count >= INTERACTION_THRESHOLD:
        # 1 Recency-weighted recent items
        recently_viewed = sorted(interactions, key=lambda x: x['created_at'], reverse=True)
        product_ids = []
        seen = set()
        for i in recently_viewed:
            pid = i['item_id']
            if pid not in seen:
                seen.add(pid)
                product_ids.append(pid)
            if len(product_ids) >= 5:
                break

        # 2 Define weights
        content_weight = 0.7 if interaction_count <= 10 else 0.6 if interaction_count <= 20 else 0.5
        collab_weight = 0.3 if interaction_count <= 10 else 0.4 if interaction_count <= 20 else 0.5

        # 3 Fetch recommendations
        all_recs = {}
        categories = set()
        already_seen = set(i['item_id'] for i in interactions)

        for product_id in product_ids:
            recs = get_hybrid_recommendations(product_id, visitor_id, top_n=10)
            for rec in recs:
                # Boost unseen products
                base_score = rec['score'] * (1.2 if rec['product_id'] not in already_seen else 1.0)
                all_recs[rec['product_id']] = all_recs.get(rec['product_id'], 0) + base_score

            # Capture categories viewed
            connection = get_db_connection()
            if connection:
                try:
                    cursor = connection.cursor(pymysql.cursors.DictCursor)
                    cursor.execute("""SELECT category FROM products WHERE id = %s""", (product_id,))
                    cat = cursor.fetchone()
                    if cat: categories.add(cat['category'])
                    cursor.close()
                    connection.close()
                except Exception as e:
                    print(f"[category lookup] {e}")

        # 4 Fetch product data
        connection = get_db_connection()
        if connection and all_recs:
            try:
                cursor = connection.cursor(pymysql.cursors.DictCursor)
                product_ids_str = ",".join(str(pid) for pid in all_recs.keys())
                cursor.execute(f"""
                    SELECT id, name, price, image, category
                    FROM products
                    WHERE id IN ({product_ids_str})
                """)
                products = {p['id']: p for p in cursor.fetchall()}
                cursor.close()
                connection.close()

# 5 Score + sort
                scored = sorted([
                    {
                        "product_id": pid,
                        "name": products[pid]['name'],
                        "price": float(products[pid]['price']),
                        "image": products[pid]['image'],
                        "category": products[pid]['category'],
                        "score": score * (content_weight + collab_weight),
                        "reason": "Based on your interest in recently viewed products"
                    }
                    for pid, score in all_recs.items()
                ], key=lambda x: x['score'], reverse=True)[:top_n]

#  6 Diversify: Top 2 per category (DISABLED)
# from collections import defaultdict
# cat_buckets = defaultdict(list)
# for item in scored:
#     cat_buckets[item['category']].append(item)
# mixed_recs = []
# for bucket in cat_buckets.values():
#     mixed_recs.extend(bucket[:2])

#  Use full scored list directly
                mixed_recs = scored

#  7 Optional Surprise Boost: Add 1-2 surprise items (DISABLED)
# if len(mixed_recs) < top_n:
#     remaining = top_n - len(mixed_recs)
#     surprise_connection = get_db_connection()
#     if surprise_connection:
#         try:
#             cur = surprise_connection.cursor(pymysql.cursors.DictCursor)
#             cat_str = ",".join(["'%s'" % cat for cat in categories])
#             exclude_str = ",".join(str(p['product_id']) for p in mixed_recs)
#             cur.execute(f"""
#                 SELECT id, name, price, image, category
#                 FROM products
#                 WHERE category IN ({cat_str})
#                   AND id NOT IN ({exclude_str})
#                 ORDER BY RAND()
#                 LIMIT {remaining}
#             """)
#             surprise_items = cur.fetchall()
#             for s in surprise_items:
#                 mixed_recs.append({
#                     "product_id": s['id'],
#                     "name": s['name'],
#                     "price": float(s['price']),
#                     "image": s['image'],
#                     "category": s['category'],
#                     "score": 0,
#                     "reason": "You may also like this!"
#                 })
#             cur.close()
#             surprise_connection.close()
#         except Exception as e:
#             print(f"[surprise lookup] {e}")

                return {
                    "type": "personalized",
                    "items": mixed_recs[:top_n],
                    "status": "success",
                    "visitor_id": visitor_id
                }
            except Exception as e:
                print(f"[fetch products] {e}")

    # Fallback to trending
    trending = get_trending_products(top_n)
    for t in trending:
        t["reason"] = "Popular this week"
    return {
        "type": "trending",
        "items": trending,
        "status": "success",
        "visitor_id": visitor_id
    }

if __name__ == "__main__":
    test_visitor_id = "e0ef77fa-6e00-47b7-a157-8c6380dc34f0"
    homepage_recs = get_homepage_recommendations(test_visitor_id)
    print(json.dumps(homepage_recs, indent=2))
