import os
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from fastembed import TextEmbedding
from processor import process_document

app = FastAPI(title="GovMind AI Ingestion Service")

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost:8000")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "dummy-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize embedding model for query embedding endpoint
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

class QueryRequest(BaseModel):
    text: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/ingest")
async def ingest_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read file content into memory
    content = await file.read()
    
    # Process the document in the background to avoid blocking the HTTP response
    background_tasks.add_task(process_document, content, file.filename, supabase)
    
    return {"message": "Document accepted for processing", "filename": file.filename}

@app.post("/embed-query")
def embed_query(req: QueryRequest):
    # Generate embedding for the search query to be used by Next.js
    emb = list(embedding_model.embed([req.text]))[0]
    return {"embedding": emb.tolist()}
