from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from pymongo import MongoClient
from datetime import datetime
from contextlib import asynccontextmanager
from rag import ask
from ingest import ingest_file
from config import *
import shutil, os


# clients
qdrant = QdrantClient(QDRANT_URL)
mongo = MongoClient(MONGO_URL)
db = mongo[MONGO_DB]
files_col = db[MONGO_COLLECTION]


@asynccontextmanager
async def lifespan(app: FastAPI):
    default_files = [
        {"path": "../data/monopoly_rules.txt", "filename": "monopoly_rules.txt"},
        {"path": "../data/syllabus.pdf", "filename": "syllabus.pdf"},
    ]

    for file in default_files:
        existing = files_col.find_one({"filename": file["filename"]})
        if not existing:
            print(f"Ingesting default file: {file['filename']}")
            chunk_count = ingest_file(file["path"])
            files_col.insert_one({
                "filename": file["filename"],
                "uploaded_at": datetime.now().isoformat(),
                "chunks": chunk_count,
                "source_path": file["path"]
            })
            print(f"✓ Default file ingested: {file['filename']}")
        else:
            print(f"✓ Already exists, skipping: {file['filename']}")

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    chunk_count = ingest_file(temp_path)

    files_col.insert_one({
        "filename": file.filename,
        "uploaded_at": datetime.now().isoformat(),
        "chunks": chunk_count,
        "source_path": temp_path
    })

    os.remove(temp_path)

    return {"message": f"{file.filename} uploaded and stored successfully"}


@app.get("/files")
def get_files():
    files = list(files_col.find({}, {"_id": 0}))
    return {"files": files}


@app.delete("/files/{filename}")
def delete_file(filename: str):
    file_record = files_col.find_one({"filename": filename})

    if not file_record:
        return {"error": f"File '{filename}' not found."}, 404

    source_path = file_record["source_path"]
    files_col.delete_one({"filename": filename})

    try:
        qdrant.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="source",
                        match=MatchValue(value=source_path)
                    )
                ]
            )
        )
        print(f"✔ Deleted vectors for source: {source_path}")
    except Exception as e:
        print(f"Qdrant delete error: {e}")

    return {"message": f"{filename} deleted successfully"}


@app.get("/records")
def get_records():
    try:
        records, _ = qdrant.scroll(
            collection_name=COLLECTION_NAME,
            limit=100,
            with_payload=True,
            with_vectors=False
        )
        return {
            "total": qdrant.count(collection_name=COLLECTION_NAME).count,
            "records": [
                {
                    "id": r.id,
                    "text": r.payload["text"],
                    "source": r.payload.get("source", "unknown")
                }
                for r in records
            ]
        }
    except Exception as e:
        return {"total": 0, "records": [], "error": str(e)}


@app.delete("/records/{record_id}")
def delete_record(record_id: int):
    qdrant.delete(
        collection_name=COLLECTION_NAME,
        points_selector=[record_id]
    )
    return {"message": f"Record {record_id} deleted"}


@app.delete("/reset")
def reset_collection():
    qdrant.delete_collection(collection_name=COLLECTION_NAME)
    files_col.drop()
    return {"message": "All data deleted."}


@app.post("/ask")
def ask_question(body: Question):
    answer = ask(body.question)
    return {"answer": answer}



app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")