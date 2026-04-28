from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from uuid import uuid4
from config import *

def ingest_file(filepath: str) -> int:   
    print(f"\n--- Starting ingest for: {filepath} ---")

    if filepath.endswith(".pdf"):
        docs = PyPDFLoader(filepath).load()
    else:
        docs = TextLoader(filepath).load()
    print(f"✓ Loaded {len(docs)} pages/documents")

    chunks = RecursiveCharacterTextSplitter(
        chunk_size=700, chunk_overlap=100
    ).split_documents(docs)
    print(f"✓ Created {len(chunks)} chunks")

    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
    print(f"✓ Embedding {len(chunks)} chunks...")
    vectors = embeddings.embed_documents([c.page_content for c in chunks])
    print(f"✓ Created {len(vectors)} vectors")

    client = QdrantClient(QDRANT_URL)
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=len(vectors[0]), distance=Distance.COSINE)
        )
        print(f"✓ Created collection: {COLLECTION_NAME}")
    else:
        print(f"✓ Collection exists, adding to it")

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=str(uuid4()),
                vector=vectors[i],
                payload={"text": chunks[i].page_content, "source": filepath}
            )
            for i in range(len(vectors))
        ]
    )
    total = client.count(collection_name=COLLECTION_NAME).count
    print(f"✔ Stored {len(vectors)} vectors. Total: {total}")
    print(f"--- Ingest complete ---\n")

    return len(chunks)  