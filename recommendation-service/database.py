import pymysql
import os
from dotenv import load_dotenv
import traceback

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

def get_db_connection():
    try:
        print("🔌 Attempting to connect to the database using PyMySQL...")

        host = os.getenv('DB_HOST', 'localhost')
        user = os.getenv('DB_USER', 'root')
        password = os.getenv('DB_PASSWORD') or ''
        database = os.getenv('DB_NAME', 'intellicart-db')

        print(f"Host: {host}")
        print(f"User: {user}")
        print(f"Database: {database}")
        print(f"Password: {'empty' if password == '' else '***'}")

        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=3306,
            connect_timeout=5
        )

        print("✅ Database connection established successfully!")
        return connection

    except Exception as e:
        print(f"❌ Exception while connecting to database: {e}")
        print(traceback.format_exc())
        return None
