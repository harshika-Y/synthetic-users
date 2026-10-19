import os
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.groq_client = None
        self.openai_client = None
        self.reinit()

    def reinit(self):
        # 1. Initialize OpenAI client (Official ChatGPT)
        if settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI (ChatGPT) client initialized.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
                self.openai_client = None
        else:
            self.openai_client = None

        # 2. Initialize Groq client
        if settings.GROQ_API_KEY:
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
                logger.info("Groq client initialized.")
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
                self.groq_client = None
        else:
            self.groq_client = None

    def is_live_available(self) -> bool:
        if settings.DEMO_MODE:
            return False
        return (self.openai_client is not None and bool(settings.OPENAI_API_KEY)) or \
               (self.groq_client is not None and bool(settings.GROQ_API_KEY))

    def get_active_provider(self) -> str:
        if settings.AI_PROVIDER == "openai" and self.openai_client:
            return "openai"
        if settings.AI_PROVIDER == "groq" and self.groq_client:
            return "groq"
        # Auto-detect: prioritize OpenAI if available, else Groq
        if self.openai_client:
            return "openai"
        if self.groq_client:
            return "groq"
        return "autonomous"

    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        json_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Executes live completion via OpenAI (ChatGPT) or Groq if available;
        otherwise returns live=False to let autonomous semantic engine handle it.
        """
        provider = self.get_active_provider()
        if provider == "autonomous" or not self.is_live_available():
            return {"live": False, "content": None, "provider": "autonomous"}

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        response_format = {"type": "json_object"} if json_mode else None

        # Call OpenAI (ChatGPT)
        if provider == "openai" and self.openai_client:
            try:
                model_name = settings.OPENAI_MODEL or "gpt-4o-mini"
                completion = self.openai_client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temperature,
                    response_format=response_format,
                    max_tokens=2048
                )
                raw_text = completion.choices[0].message.content
                return {"live": True, "content": raw_text, "provider": "openai", "model": model_name}
            except Exception as e:
                logger.error(f"OpenAI API call error: {e}")
                # Fallback to Groq if available
                if self.groq_client:
                    provider = "groq"
                else:
                    return {"live": False, "content": None, "error": str(e), "provider": "openai"}

        # Call Groq
        if provider == "groq" and self.groq_client:
            try:
                model_name = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
                completion = self.groq_client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temperature,
                    response_format=response_format,
                    max_tokens=2048
                )
                raw_text = completion.choices[0].message.content
                return {"live": True, "content": raw_text, "provider": "groq", "model": model_name}
            except Exception as e:
                logger.error(f"Groq API call error: {e}")
                return {"live": False, "content": None, "error": str(e), "provider": "groq"}

        return {"live": False, "content": None, "provider": "autonomous"}

llm_service = LLMService()
