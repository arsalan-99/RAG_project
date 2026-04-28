from dotenv import load_dotenv
import os

load_dotenv()

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text:v1.5")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "my_data")

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "rag_app")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "uploaded_files")

LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://openrouter.ai/api/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-120b:free")

if not LLM_API_KEY:
    raise RuntimeError("LLM_API_KEY is not set. Please create a .env file. See .env.example.")