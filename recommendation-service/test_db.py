import pymysql
import traceback

try:
    print("🔌 Trying to connect to MySQL (using PyMySQL)...")

    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='intellicart-db',
        port=3306,
        connect_timeout=5
    )

    print("✅ Successfully connected to MySQL database (via PyMySQL).")

    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        print(f"🛒 Total products: {count}")

    connection.close()

except Exception as e:
    print(f"❌ Exception occurred: {e}")
    print(traceback.format_exc())

input("Press Enter to exit...")
