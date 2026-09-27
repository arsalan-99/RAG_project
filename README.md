# RAG Demo

A Retrieval-Augmented Generation (RAG) web app. Upload documents (PDF or TXT), and ask questions about them. The system retrieves relevant chunks from a vector database and uses an LLM to answer.

## Stack

- **Backend:** FastAPI (Python)
- **Vector DB:** Qdrant (local)
- **Document DB:** MongoDB (local)
- **Embeddings:** Ollama (`nomic-embed-text:v1.5`, runs locally)
- **LLM:** OpenRouter API
- **Frontend:** Plain HTML/CSS/JS (served by FastAPI)

## Prerequisites

Make sure these are installed and running before starting:

1. [Ollama](https://ollama.com/) — running locally with the embedding model pulled:
```bash
   ollama pull nomic-embed-text:v1.5
```

2. [Qdrant](https://qdrant.tech/documentation/quick-start/) — running on `localhost:6333`:
```bash
   docker run -p 6333:6333 qdrant/qdrant
```

3. [MongoDB](https://www.mongodb.com/docs/manual/installation/) — running on `localhost:27017`

4. An [OpenRouter](https://openrouter.ai/) account with an API key

## Setup

1. Clone the repository:
```bash
   git clone <your-repo-url>
   cd <repo-folder>
```

2. Create a virtual environment and install dependencies:
```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
```

3. Set up environment variables:
```bash
   cp .env.example .env
```
   Open `.env` and fill in your `LLM_API_KEY`.

4. Run the backend:
```bash
   cd backend
   uvicorn server:app --reload
```

5. Open your browser at [http://localhost:8000](http://localhost:8000)

## Project Structure
rag_app/  
├── backend/  
│   ├── config.py       # Loads config from .env  
│   ├── ingest.py       # Chunking, embedding, storing in Qdrant  
│   ├── rag.py          # Query + LLM call  
│   └── server.py       # FastAPI routes  
├── frontend/  
│   ├── index.html      # Q&A page  
│   ├── files.html      # Upload & manage files  
│   ├── admin.html      # Vector DB dashboard  
│   ├── script.js  
│   ├── files.js  
│   ├── admin.js  
│   └── style.css  
├── data/               # Default demo files (auto-ingested on startup)  
├── .env.example        # Copy this to .env and fill in your key  
├── requirements.txt  
└── README.md  
