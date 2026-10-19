import math
import re
import hashlib
from typing import List, Dict, Any, Tuple
import numpy as np

class LocalVectorMemory:
    """
    Lightweight, deterministic local semantic vector memory store using TF-IDF & Cosine Similarity.
    Persists embeddings in memory or SQLite for conversational retrieval without external cloud APIs.
    """
    def __init__(self):
        self._vocab: Dict[str, int] = {}
        self._idf: Dict[str, float] = {}

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z0-9_]{3,}\b', text.lower())
        tokens = list(words)
        # Add character 3-grams and 4-grams for subword semantic matching (e.g. allerg -> allergic, allergies)
        for w in words:
            if len(w) >= 4:
                for n in (3, 4):
                    for i in range(len(w) - n + 1):
                        tokens.append(w[i:i+n])
        return tokens

    def embed_text(self, text: str) -> List[float]:
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * 128
        
        # Deterministic MD5 hash trick to fixed 128-dim normalized vector
        vec = np.zeros(128, dtype=np.float32)
        for token in tokens:
            h = int(hashlib.md5(token.encode('utf-8')).hexdigest()[:8], 16)
            idx = h % 128
            vec[idx] += 1.0
        
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        dot = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(dot / (norm1 * norm2))

    def retrieve_relevant(
        self,
        query: str,
        memories: List[Dict[str, Any]],
        top_k: int = 3,
        threshold: float = 0.15
    ) -> List[Dict[str, Any]]:
        if not memories:
            return []
        
        q_vec = self.embed_text(query)
        scored: List[Tuple[float, Dict[str, Any]]] = []
        
        for mem in memories:
            m_text = mem.get("memory_text") or mem.get("content", "")
            m_vec = mem.get("embedding")
            if not m_vec or len(m_vec) != len(q_vec):
                m_vec = self.embed_text(m_text)
            
            sim = self.cosine_similarity(q_vec, m_vec)
            if sim >= threshold:
                scored.append((sim, mem))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

vector_memory = LocalVectorMemory()
