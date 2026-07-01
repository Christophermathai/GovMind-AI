import io
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from fastembed import TextEmbedding

# Initialize embedding model (downloads automatically on first run)
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

def process_document(file_content: bytes, filename: str, supabase_client):
    try:
        print(f"Starting processing for {filename}")
        
        # 1. Parse PDF
        reader = PdfReader(io.BytesIO(file_content))
        full_text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                full_text += extracted + "\n"
                
        if not full_text.strip():
            print(f"Warning: No text extracted from {filename}")
            return
            
        # 2. Insert into Documents table
        doc_res = supabase_client.table("documents").insert({
            "title": filename,
            "source_filename": filename
        }).execute()
        
        document_id = doc_res.data[0]["id"]
        
        # 3. Chunk Text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        chunks = text_splitter.split_text(full_text)
        
        # 4. Generate Embeddings & Insert
        embeddings = list(embedding_model.embed(chunks))
        
        # Batch insert chunks
        chunk_records = []
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            chunk_records.append({
                "document_id": document_id,
                "content": chunk,
                "embedding": emb.tolist(),
                "chunk_index": i
            })
            
            # Insert in batches of 100 to avoid request limits
            if len(chunk_records) >= 100:
                supabase_client.table("document_chunks").insert(chunk_records).execute()
                chunk_records = []
                
        # Insert remaining
        if chunk_records:
            supabase_client.table("document_chunks").insert(chunk_records).execute()
            
        print(f"Successfully processed and embedded {len(chunks)} chunks for {filename}")
        
    except Exception as e:
        print(f"Error processing document {filename}: {str(e)}")
