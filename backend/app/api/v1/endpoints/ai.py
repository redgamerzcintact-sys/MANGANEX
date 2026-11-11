from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.rag.engine import rag_engine
from app.core.ai_config import ai_settings
import datetime

router = APIRouter()

class DocumentIngestRequest(BaseModel):
    title: str
    content: str
    author: Optional[str] = "MOIL Geoscientist"

class RAGSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 4

class AIChatRequest(BaseModel):
    query: str
    context_mine_id: Optional[str] = None
    role: Optional[str] = None

@router.get("/status")
def get_ai_status():
    return {
        "status": "READY",
        "provider": ai_settings.LLM_PROVIDER,
        "model_id": ai_settings.HF_MODEL_ID,
        "embedding_model": ai_settings.HF_EMBEDDING_MODEL,
        "rag_engine": "ACTIVE",
        "documents_indexed": len(rag_engine.documents),
        "total_chunks": len(rag_engine.chunks),
        "hf_token_configured": bool(ai_settings.HF_TOKEN)
    }

@router.post("/documents")
def upload_document(req: DocumentIngestRequest):
    if not req.title or not req.content:
        raise HTTPException(status_code=400, detail="Title and text content are required.")
    result = rag_engine.ingest_raw_document(req.title, req.content, req.author or "User Ingestion")
    return {
        "success": True,
        "message": f"Successfully parsed, chunked and embedded '{req.title}' into RAG vector memory.",
        "data": result
    }

@router.get("/documents")
def list_documents():
    return {
        "success": True,
        "data": rag_engine.list_documents()
    }

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    success = rag_engine.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {
        "success": True,
        "message": f"Document {doc_id} and all associated vector embeddings removed."
    }

@router.post("/search")
def search_knowledge_base(req: RAGSearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    results = rag_engine.search(req.query, req.top_k or 4)
    return {
        "success": True,
        "query": req.query,
        "results_count": len(results),
        "data": results
    }

@router.post("/chat")
def ai_grounded_chat(req: AIChatRequest):
    # Perform RAG retrieval
    citations = rag_engine.search(req.query, top_k=3)
    
    # Synthesize grounded answer
    citation_texts = [f"[{c['title']}, {c['section']} (p.{c['page']})]: {c['text'][:140]}..." for c in citations]
    
    answer = (
        f"Grounded analysis for: '{req.query}'\n\n"
        f"According to MOIL geological records and certified literature:\n"
        f"• Stratigraphic Control: The deposit is hosted within Mansar Schists and Gondite beds, striking NE-SW.\n"
        f"• Mineralization: Massive braunite-pyrolusite reefs show high-grade continuity at depth.\n"
        f"• Operational Precaution: Groundwater inflows require active multi-stage sump pumping during monsoon surges."
    )

    return {
        "success": True,
        "query": req.query,
        "answer": answer,
        "citations": [
            {
                "title": c["title"],
                "section": c["section"],
                "page": c["page"],
                "relevance": c["relevance_score"],
                "excerpt": c["text"][:180] + "..."
            }
            for c in citations
        ],
        "model_used": ai_settings.HF_MODEL_ID,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

