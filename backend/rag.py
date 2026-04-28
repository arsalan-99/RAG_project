from langchain_ollama import OllamaEmbeddings
from qdrant_client import QdrantClient
from openai import OpenAI
from config import *

embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
client = QdrantClient(QDRANT_URL)
llm_client = OpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY)

def ask(question):
    query_vector = embeddings.embed_query(question)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=5
    )

    context = "\n\n".join([r.payload["text"] for r in results.points])

    response = llm_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {
                "role": "user",
                "content": f"""Answer the question based on the context below. If the answer is not fully covered by the context, supplement with your own knowledge.

Context:
{context}

Question:
{question}"""
            }
        ]
    )

    return response.choices[0].message.content