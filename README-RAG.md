# AION Frontend RAG Integration

This UI adds RAG (Retrieval-Augmented Generation) support in frontend.

How it works

- The frontend tries server-side RAG when building prompts via `/api/rag/query`.
- If server-side RAG is unavailable, it falls back to local IndexedDB retrieval via `memoryService`.
- The `Memories` panel includes an `Index` button that batches and ingests memories into `/api/rag/ingest`.
- When a new episodic memory is logged, the frontend automatically issues a RAG ingest (`/api/rag/ingest`) for the new memory to keep the index up-to-date.

How to use

- Start your backend:

```powershell
cd aion_backend
python server.py
```

- Start the frontend normally (CRA):

```powershell
cd aion_interface
npm start
```

- In the Memories panel, click `Index` to push all local memories to the backend vector store.

Notes

- If the backend is configured with Qdrant (via `QDRANT_HOST`), RAG will use Qdrant for storage and retrieval.
- The backend includes `scripts/index_memories.py` to run indexing via admin endpoint if you prefer an admin-side sync.
